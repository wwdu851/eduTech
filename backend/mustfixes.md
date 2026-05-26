## 具体问题清单

### 🔴 Critical（必须修）

1. **Neo4j 密码硬编码**
   ```javascript
   // config/neo4j.js
   process.env.NEO4J_PASSWORD || 'neo4jneo4j'  // 这默认密码太弱了
   ```
   生产环境绝对不能用默认密码，而且这密码还是重复的字符串，基本等于没密码。

2. **JWT_SECRET 没有默认值保护**
   ```javascript
   // auth.service.js
   const JWT_SECRET = process.env.JWT_SECRET;
   if (!JWT_SECRET) {
     throw new Error('...');  // 这样可以，但启动时就该验证所有必需的 env
   }
   ```
   建议在 `server.js` 启动时统一验证所有环境变量，别等到运行时才炸。

3. **GEMINI_API_KEY 没验证**
   `ai.service.js` 里直接用 `process.env.GEMINI_API_KEY`，如果没设这个环境变量，只会在第一次调用 AI 时才报错。应该启动时就检查。

4. **Rate Limiting 太宽松**
   ```javascript
   limit: 100,  // 每 15 分钟 100 次
   ```
   对于免费用户这太宽了，特别是 AI 调用。你的 `aiLimiter` 是 10 次/小时，这个合理，但普通接口 100 次可能还是多。

5. **错误处理不完整**
   很多地方直接 `throw new Error()`，前端会收到什么？GraphQL 会把 stack trace 暴露出来吗？应该统一错误格式，不要泄露内部信息。

### 🟡 Important（应该修）

1. **IDOR 防护不够**
   ```javascript
   // kanban.repository.js
   async getCard(userId, cardId) {
     // ✅ 这里验证了 userId
     MATCH (u:User {id: $userId})-[:CREATED]->(c:KanbanCard {id: $cardId})
   ```
   这个做得对，但其他地方要确保每个查询都检查 ownership。你的 `linkKnowledgeToCard` 也做了，不错。

2. **Safety Service 的关键词过滤太简陋**
   ```javascript
   this.bannedKeywords = [
     'inappropriate', 'offensive', 'bannedword1', 'bannedword2'
   ];
   ```
   这基本等于没有。真要做内容审核，要么接第三方服务（如 Perspective API），要么至少弄个像样的词库。而且现在是完全匹配，用户打个空格就绕过了。

3. **输入 Sanitization 太激进**
   ```javascript
   sanitizeHtml(input, {
     allowedTags: [],  // 全部去掉
   })
   ```
   这意味着用户连换行都不能有，体验会很差。如果不支持富文本，至少保留 `\n` 或者允许 `<br>`。

4. **No Transaction Support**
   ```javascript
   // knowledge.service.js
   for (const point of knowledgePoints) {
     const node = await knowledgeRepo.createNode(...);  // 如果这里第 3 个失败了？
   }
   ```
   Neo4j 支持事务，应该包在一个 transaction 里。现在如果中途失败，会留下一半数据。

5. **AI Response Parsing 不够健壮**
   ```javascript
   const jsonMatch = response.match(/\{[\s\S]*\}/);
   if (!jsonMatch) throw new Error('Invalid AI response format');
   return JSON.parse(jsonMatch[0]);
   ```
   正则匹配 JSON 不可靠，如果 AI 返回的是嵌套对象或者带注释的文本，会炸。应该：
   - 明确告诉 AI 只返回 JSON，别带其他文字
   - 用更严格的解析（比如先 trim，再找第一个 `{` 和最后一个 `}`）
   - 有个 fallback

6. **CORS 配置太开放（对 development）**
   ```javascript
   cors({
     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
     credentials: true
   })
   ```
   开发时 OK，但生产环境要明确设置 `FRONTEND_URL`，别留 fallback。

### 🟢 Nice to Have（可以晚点修）

1. **日志系统**
   现在只有 `console.log`，生产环境应该用 Winston 或 Pino，分级别记日志，方便查问题。

2. **Metrics & Monitoring**
   没有任何监控埋点。至少加个 Prometheus metrics 或者 APM（如 New Relic），知道系统运行状况。

3. **Health Check Endpoint**
   ```javascript
   app.get('/health', (req, res) => {
     res.json({ status: 'ok', timestamp: Date.now() });
   });
   ```
   部署到 Kubernetes 或 Docker 时需要这个。

4. **GraphQL Query Complexity Limiting**
   现在没限制查询复杂度，用户可以写个超深的嵌套查询搞死你的数据库。

5. **Database Connection Pooling**
   Neo4j driver 默认有连接池，但没看到你配置。应该明确设置 `maxConnectionPoolSize` 等参数。

6. **Pagination**
   ```javascript
   async getUserBoard(userId) {
     // 返回全部卡片，没分页
   ```
   如果用户有 1000 张卡片呢？

## 安全问题汇总

| 问题 | 严重性 | 现状 |
|------|--------|------|
| 默认密码弱 | 🔴 Critical | `neo4jneo4j` |
| 环境变量未验证 | 🔴 Critical | 只验证了 JWT_SECRET |
| 错误信息泄露 | 🟡 Medium | 可能暴露内部错误 |
| Rate Limiting | 🟡 Medium | AI 限制 OK，普通接口偏宽 |
| 内容审核 | 🟡 Medium | 基本等于没有 |
| IDOR 防护 | 🟢 Low | 做得不错 |
| CSRF | 🟢 Low | 用了 httpOnly cookie + SameSite |

## 给你个 Checklist

上线前至少要做这些：

```bash
# 1. 环境变量检查
✅ NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD (强密码)
✅ JWT_SECRET (至少 32 字节随机字符串)
✅ GEMINI_API_KEY
✅ FRONTEND_URL (生产域名)
✅ NODE_ENV=production

# 2. 代码修改
✅ 启动时验证所有环境变量
✅ 添加事务支持到 knowledge.service
✅ 改进 AI response parsing
✅ 添加健康检查 endpoint
✅ 配置日志系统
✅ 添加分页到 getUserBoard

# 3. 测试
✅ 跑一遍所有 GraphQL 查询/mutation
✅ 测试 rate limiting 真的生效
✅ 测试 IDOR 防护（尝试访问别人的 card）
✅ 测试 AI 服务挂掉的情况

# 4. 部署配置
✅ 反向代理（Nginx/Caddy）配置 HTTPS
✅ 设置防火墙规则
✅ 配置日志收集
✅ 设置监控告警
```
