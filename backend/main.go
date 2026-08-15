// myworld-backend：前后端分离后的 Go 后端，功能对齐原 server.js
// 接口：
//   GET  /api/health                 健康检查
//   POST /api/vote                   投票（内存存储）
//   GET  /api/votes                  获取投票数据
//   GET  /api/bilibili/user/videos?mid=xxx   B站用户视频代理（带 UA 池 / 限流）
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"math/rand"
	"net/http"
	"os"
	"strconv"
	"sync"
	"time"
)

// ---------- 投票（内存存储） ----------
var (
	votes     = make(map[string]int)
	votesLock sync.Mutex
)

// ---------- B站代理：限流 ----------
var (
	lastRequestTime time.Time
	rateLock        sync.Mutex
	minInterval     = 3 * time.Second
)

// 用户代理池
var userAgents = []string{
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0",
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
	"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
}

func getRandomUserAgent() string {
	return userAgents[rand.Intn(len(userAgents))]
}

// 请求限流：最小间隔 3 秒 + 额外随机 0-2 秒，避免触发风控
func waitBeforeRequest() {
	rateLock.Lock()
	defer rateLock.Unlock()
	now := time.Now()
	elapsed := now.Sub(lastRequestTime)
	if elapsed < minInterval {
		wait := minInterval - elapsed + time.Duration(rand.Intn(2000))*time.Millisecond
		fmt.Printf("请求频率限制，等待 %s...\n", wait.Round(time.Second))
		time.Sleep(wait)
	}
	lastRequestTime = time.Now()
}

// ---------- 工具函数 ----------
func writeJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

// CORS 中间件：前后端分离部署（不同域名/端口）时允许跨域
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// ---------- 接口处理 ----------

// GET /api/health
func handleHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]interface{}{
		"status":    "ok",
		"timestamp": time.Now().Format(time.RFC3339),
		"message":   "Backend server is running",
	})
}

// POST /api/vote  请求体: { "option": <任意值> }
func handleVote(w http.ResponseWriter, r *http.Request) {
	var body map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]interface{}{"error": "invalid JSON body"})
		return
	}
	option, ok := body["option"]
	if !ok || option == nil {
		writeJSON(w, http.StatusBadRequest, map[string]interface{}{"error": "missing option"})
		return
	}
	key := fmt.Sprint(option)
	votesLock.Lock()
	votes[key]++
	votesLock.Unlock()
	writeJSON(w, http.StatusOK, map[string]interface{}{"success": true})
}

// GET /api/votes
func handleVotes(w http.ResponseWriter, r *http.Request) {
	votesLock.Lock()
	defer votesLock.Unlock()
	writeJSON(w, http.StatusOK, votes)
}

// GET /api/bilibili/user/videos?mid=xxx
func handleBilibiliVideos(w http.ResponseWriter, r *http.Request) {
	waitBeforeRequest()

	mid := r.URL.Query().Get("mid")
	if mid == "" {
		writeJSON(w, http.StatusBadRequest, map[string]interface{}{"error": "missing mid param"})
		return
	}

	fmt.Printf("正在请求B站API, 用户ID: %s, 时间: %s\n", mid, time.Now().Format("15:04:05"))

	// 构造 B站请求（含 Wbi 签名参数）
	req, err := http.NewRequest(http.MethodGet, "https://api.bilibili.com/x/space/arc/search", nil)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]interface{}{
			"error": "Request setup failed", "message": err.Error(),
		})
		return
	}
	q := req.URL.Query()
	q.Set("mid", mid)
	q.Set("ps", "30")
	q.Set("pn", "1")
	q.Set("wts", strconv.FormatInt(time.Now().Unix(), 10))
	q.Set("web_location", "1550101")
	req.URL.RawQuery = q.Encode()

	req.Header.Set("User-Agent", getRandomUserAgent())
	req.Header.Set("Referer", "https://space.bilibili.com/"+mid)
	req.Header.Set("Accept", "application/json, text/plain, */*")
	req.Header.Set("Accept-Language", "zh-CN,zh;q=0.9,en;q=0.8")
	req.Header.Set("Accept-Encoding", "gzip, deflate, br")
	req.Header.Set("Origin", "https://www.bilibili.com")
	req.Header.Set("Connection", "keep-alive")
	req.Header.Set("Sec-Fetch-Dest", "empty")
	req.Header.Set("Sec-Fetch-Mode", "cors")
	req.Header.Set("Sec-Fetch-Site", "same-site")
	req.Header.Set("Sec-Ch-Ua", `"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"`)
	req.Header.Set("Sec-Ch-Ua-Mobile", "?0")
	req.Header.Set("Sec-Ch-Ua-Platform", `"Windows"`)
	req.Header.Set("Cache-Control", "no-cache")
	req.Header.Set("Pragma", "no-cache")

	client := &http.Client{Timeout: 25 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		// 请求已发出但没有收到响应
		writeJSON(w, http.StatusServiceUnavailable, map[string]interface{}{
			"error":   "No response from Bilibili server",
			"message": "B站服务器无响应，请稍后重试",
		})
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]interface{}{
			"error": "Failed to read Bilibili response", "message": err.Error(),
		})
		return
	}

	// 透传 B站原始响应（状态码 + JSON），与 Node 版行为一致
	ct := resp.Header.Get("Content-Type")
	if ct == "" {
		ct = "application/json; charset=utf-8"
	}
	w.Header().Set("Content-Type", ct)
	w.WriteHeader(resp.StatusCode)
	_, _ = w.Write(body)
}

// ---------- 入口 ----------
func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/health", handleHealth)
	mux.HandleFunc("POST /api/vote", handleVote)
	mux.HandleFunc("GET /api/votes", handleVotes)
	mux.HandleFunc("GET /api/bilibili/user/videos", handleBilibiliVideos)

	fmt.Println("=================================")
	fmt.Printf("Go backend server running on port %s\n", port)
	fmt.Printf("Health check: http://localhost:%s/api/health\n", port)
	fmt.Printf("Bilibili API: http://localhost:%s/api/bilibili/user/videos?mid=165392864\n", port)
	fmt.Println("=================================")

	if err := http.ListenAndServe(":"+port, corsMiddleware(mux)); err != nil {
		fmt.Fprintln(os.Stderr, "Server error:", err)
		os.Exit(1)
	}
}
