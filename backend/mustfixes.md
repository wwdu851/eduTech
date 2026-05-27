### 🔴 一个新 Bug（需要立刻修）

**`knowledge.repository.js` 里事务用法有问题：**

```javascript
async createNode(nodeData, tx = null) {
  const session = tx ? null : driver.session();
  const runner = tx || session;
  try {
    const result = await runner.run(...)  // ❌ 传入 tx 时直接 run
  } finally {
    if (session) await session.close();
  }
}
```

Neo4j 事务对象（`ManagedTransaction`）没有 `.run()` 方法，正确的是用 `tx.run()`。但更根本的问题是，`knowledge.service.js` 里调用 `session.executeWrite(async tx => {...})` 之后，在回调内又调用了 `knowledgeRepo.createNode({...}, tx)`，然后 repo 里又试图用这个 `tx` 去 `.run()`。

实际上 `ManagedTransaction` 是有 `.run()` 的，所以这个可能跑得通，但结构很脆弱。`getGraphByUser` 传了 `tx` 参数但没有任何地方真正需要它在事务内运行，这个 `tx` 参数是多余的。

建议简化：把事务逻辑完全收在 `knowledge.service.js` 里，repo 只做无状态的 session 查询。

### 🟡 几个中等问题

**1. `@neo4j/graphql` 装了但没用**

`package.json` 里有 `@neo4j/graphql: ^7.5.3`，但代码里完全没有 import 它，只是白占了几十MB 和一堆 transitive dependencies（`@apollo/subgraph`、`graphql-compose` 等）。删掉：

```bash
npm uninstall @neo4j/graphql
```

**2. `server.js` 里 rate limiting 只在生产环境开启**

```javascript
if (env.NODE_ENV === 'production') {
  app.use(limiter);
  app.use('/graphql', aiLimiter);
}
```

开发环境不限速可以理解，但这意味着测试时你根本不知道 rate limiting 是否真的生效。建议至少在 `test` 环境也开启，或者加一个更宽松的开发限速。

**3. `sanitizeInput` 允许 HTML 标签但 GraphQL 返回纯文本**

```javascript
allowedTags: ['br', 'p', 'b', 'i', 'strong', 'em'],
```

你的 schema 里 `content` 和 `title` 都是 `String` 类型，前端如果不特别处理，`<b>加粗</b>` 这种字符串会直接显示出来。要么前端渲染 HTML，要么这里继续 strip 所有标签。两边需要对齐。

**4. CORS 开发环境太松了**

```javascript
if (!origin || env.NODE_ENV !== 'production') {
  return callback(null, true);  // 开发环境放行所有请求
}
```

`!origin` 包括了所有服务端请求（curl、Postman 等），这在生产也会被放行，因为这个判断在 `env.NODE_ENV !== 'production'` 之前。不过你的生产 CORS 逻辑后面会覆盖这个，所以实际影响不大，但逻辑有点绕。

**5. `aiLimiter` 的 `skip` 逻辑依赖请求 body 字符串匹配**

```javascript
skip: (req) => {
  return !req.body?.query?.includes('startAIInquiry');
}
```

这个 middleware 在 `express.json()` 之后注册，body 应该是 parsed 的，但 GraphQL 的 `query` 字段是字符串，所以 `.includes('startAIInquiry')` 能工作。问题是用户可以把 mutation 命名成别的、或者用 fragment，就绕过了。这是个已知的 express 层 GraphQL rate limiting 局限性，没有完美解法，知道就行。

### 🟢 Nice to Have（还是没有的）

- 日志系统（Winston/Pino）
- 数据库连接池配置
- `init-db.js` 里默认用户没有 email/password，如果注册逻辑要求 email 这个 User 节点会有问题
- `tags` 字段在 schema 里有但没有 CRUD 支持

---

## 总结

跟上一版比已经是质的提升，主要剩下的问题是：

1. 删掉 `@neo4j/graphql` 这个没用的包
2. 理清 knowledge repo 的事务传参逻辑，测一下是否真的能跑通
3. HTML 标签 sanitization 跟前端对齐

如果这三个搞定了，加上把 `.env` 配好，个人项目或者小范围测试用完全可以上了。
