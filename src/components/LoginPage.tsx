import { useState } from "react"
import { login } from "../services/api"

interface Props {
  onLogin: () => void
}

export default function LoginPage({ onLogin }: Props) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit() {
    setError("")
    setLoading(true)
    try {
      await login(username, password)
      onLogin()
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="brand-mark">☯</div>
        <h1>覆雪之下</h1>
        <p>永不落幕的梦</p>
        <input
          autoComplete="username"
          placeholder="用户名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          autoComplete="current-password"
          placeholder="密码"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        {error && <div className="error-text">{error}</div>}
        <button onClick={submit} disabled={loading}>
          {loading ? "登录中..." : "进入雪岛"}
        </button>
      </div>
    </div>
  )
}
