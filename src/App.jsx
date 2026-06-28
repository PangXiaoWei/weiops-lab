import { useEffect, useMemo, useState } from "react";
import { commands, scenarios, dockerLabs, k3sLabs, expressions, roadmap, quizQuestions } from "./data";
import { storage } from "./storage";

const nav = [
  ["home", "Dashboard"], ["commands", "Linux 命令"], ["troubleshooting", "故障排查"], ["network", "网络诊断"], ["systemd", "Systemd"], ["docker", "Docker"], ["k3s", "K3s / K8s"], ["roadmap", "DevOps 路线"], ["english", "英文工单"], ["notes", "实验记录"], ["deploy", "部署说明"]
];

function copy(text, setMessage) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(() => setMessage("Copied.")).catch(() => legacyCopy(text, setMessage));
  } else {
    legacyCopy(text, setMessage);
  }
}

function legacyCopy(text, setMessage) {
  const area = document.createElement("textarea");
  area.value = text;
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  const copied = document.execCommand("copy");
  area.remove();
  setMessage(copied ? "Copied." : "复制失败，请手动复制。");
}

function TerminalBlock({ commandsText, title = "模拟终端" }) {
  const [open, setOpen] = useState(true);
  const [message, setMessage] = useState("");
  return <section className="terminal">
    <header><span><i></i><i></i><i></i>{title}</span><div><button onClick={() => copy(commandsText, setMessage)}>复制命令</button><button onClick={() => setOpen(!open)}>{open ? "收起" : "展开"}</button></div></header>
    {open && <pre>{commandsText.split("\n").map((line, index) => <code key={index}><b>$</b> {line}{"\n"}</code>)}</pre>}
    {message && <small className="copy-note">{message}</small>}
  </section>;
}

function ModuleTitle({ kicker, title, children }) { return <header className="page-title"><p>{kicker}</p><h1>{title}</h1>{children && <div>{children}</div>}</header>; }
function Tag({ children, kind = "blue" }) { return <span className={`tag ${kind}`}>{children}</span>; }

function App() {
  const [page, setPage] = useState(location.hash.slice(1) || "home");
  const [tick, setTick] = useState(0);
  const [quizOpen, setQuizOpen] = useState(false);
  useEffect(() => { const sync = () => setPage(location.hash.slice(1) || "home"); addEventListener("hashchange", sync); return () => removeEventListener("hashchange", sync); }, []);
  const navigate = id => { location.hash = id; };
  const refresh = () => setTick(value => value + 1);
  const favorites = storage.favorites(); const savedExpressions = storage.expressions();
  const progress = { labs: storage.labs().length, scenarios: storage.scenarios().length, commands: favorites.length, expressions: savedExpressions.length, quizzes: storage.quizzes().length, notes: storage.notes().length, stage: storage.stage() };
  const content = {
    home: <Home navigate={navigate} progress={progress} openQuiz={() => setQuizOpen(true)} />,
    commands: <Commands favorites={favorites} refresh={refresh} />, troubleshooting: <Troubleshooting refresh={refresh} />, network: <Network />, systemd: <Systemd />,
    docker: <Labs title="Docker 实验室" kicker="CONTAINERS" labs={dockerLabs} refresh={refresh} />, k3s: <Labs title="K3s / Kubernetes 入门" kicker="ORCHESTRATION" labs={k3sLabs} refresh={refresh} />,
    roadmap: <Roadmap refresh={refresh} />, english: <English saved={savedExpressions} refresh={refresh} />, notes: <Notes refresh={refresh} />, deploy: <Deploy />
  };
  return <div className="app-shell">
    <aside className="sidebar"><a className="logo" href="#home"><span>W</span><b>WeiOps<br />Lab</b></a><p className="sidebar-label">阿伟运维实验室</p><nav>{nav.map(([id, label]) => <a key={id} className={page === id ? "active" : ""} href={`#${id}`}>{label}</a>)}</nav><div className="side-status"><span>LEARNING MODE</span><strong>静态模拟环境</strong><small>不执行真实系统命令</small></div></aside>
    <main className="main-content"><header className="topline"><span>从 Linux 故障排查到 DevOps 的实战训练站</span><button className="quiz-trigger" onClick={() => setQuizOpen(true)}>开始一题测验</button></header>{content[page] || content.home}</main>
    {quizOpen && <Quiz close={() => setQuizOpen(false)} refresh={refresh} />}
  </div>;
}

function getOpsLevel(score) {
  if (score >= 16) return { name: "Level 4: Junior DevOps", pct: 100 };
  if (score >= 10) return { name: "Level 3: Docker Operator", pct: 74 };
  if (score >= 5) return { name: "Level 2: Linux Troubleshooter", pct: 48 };
  return { name: "Level 1: Ops Trainee", pct: 22 };
}

function Home({ navigate, progress, openQuiz }) {
  const [missionDone, setMissionDone] = useState(storage.opsMission());
  const toggleMission = id => {
    const next = storage.toggle(storage.keys.opsMission, id);
    setMissionDone(next);
  };
  const cards = [["commands","Linux 基础命令","38 个工作场景命令卡"],["troubleshooting","Linux 故障排查","15 个真实排障思路"],["network","网络诊断","从 DNS 到防火墙流程"],["systemd","Systemd 服务管理","服务与日志排查"],["docker","Docker 实验室","6 个模拟容器实验"],["k3s","K3s / Kubernetes","从 Pod 到 Events"],["english","英文工单表达","30 条中英工作表达"],["notes","我的实验记录","沉淀你的技术作品集"]];
  const missionItems = [
    { id: "incident", label: "完成 1 个故障任务", hint: "Incident Response", target: "troubleshooting", done: progress.scenarios >= 1 },
    { id: "error", label: "解码 1 个错误", hint: "Error Card", target: "troubleshooting", done: progress.quizzes >= 1 },
    { id: "speaking", label: "跟读 3 句英文", hint: "English Speaking Drill", target: "english", done: progress.expressions >= 3 },
    { id: "command", label: "收藏 1 条命令链路", hint: "Command Chain", target: "commands", done: progress.commands >= 1 },
    { id: "note", label: "写 1 条实验记录", hint: "Lab Note", target: "notes", done: progress.notes >= 1 }
  ];
  const completedMissions = missionItems.filter(item => item.done || missionDone.includes(item.id)).length;
  const totalScore = progress.labs + progress.scenarios + progress.commands + progress.expressions + progress.quizzes + progress.notes + completedMissions;
  const level = getOpsLevel(totalScore);
  const errorUnlocked = Math.min(20, 8 + progress.scenarios + progress.quizzes);
  const speakingToday = Math.min(5, progress.expressions);

  return <><section className="hero mission-hero"><div><p className="eyebrow">OPS MISSION CONTROL</p><h1>WeiOps Lab</h1><h2>Professional incident training dashboard</h2><p className="hero-text">把 Linux、Docker、K3s、英文工单和实验记录组织成每天可执行的运维任务。</p><div className="hero-actions"><button onClick={() => navigate("troubleshooting")}>Start Incident Mission</button><button className="secondary" onClick={openQuiz}>Run Quick Check</button></div></div><TerminalBlock title="Mission bootstrap" commandsText={"systemctl status nginx\njournalctl -u nginx -n 50\ncurl -I http://127.0.0.1:8080"} /></section>
    <section className="ops-dashboard">
      <article className="mission-panel">
        <header><div><p>TODAY'S OPS MISSION</p><h2>今日任务区</h2></div><strong>{completedMissions}/5</strong></header>
        <div className="mission-list">{missionItems.map(item => <div className={item.done || missionDone.includes(item.id) ? "mission-item done" : "mission-item"} key={item.id}><button onClick={() => toggleMission(item.id)} aria-label={item.label}>{item.done || missionDone.includes(item.id) ? "✓" : "+"}</button><div><b>{item.label}</b><span>{item.hint}</span></div><button className="jump" onClick={() => navigate(item.target)}>Go</button></div>)}</div>
      </article>
      <article className="mission-card primary"><p>MISSION MODE</p><h3>故障任务入口</h3><button onClick={() => navigate("troubleshooting")}>Start Incident Mission</button><small>从现象、命令、日志和英文描述完成一次排障闭环。</small></article>
      <article className="mission-card"><p>ERROR CARDS</p><h3>已解锁错误 {errorUnlocked} / 20</h3><ProgressBar value={errorUnlocked} max={20} /><small>通过故障场景和测验逐步收集常见错误卡片。</small></article>
      <article className="mission-card"><p>ENGLISH SPEAKING DRILL</p><h3>今日跟读 {speakingToday} / 5</h3><ProgressBar value={speakingToday} max={5} /><small>从工单表达里挑选英文句子，进行跟读和复述。</small></article>
      <article className="mission-card level-card"><p>PROGRESS LEVEL</p><h3>{level.name}</h3><ProgressBar value={level.pct} max={100} /><small>完成任务越多，等级越接近真实 DevOps 工作流。</small></article>
    </section>
    <section className="stats"><Stat label="已完成实验" value={progress.labs} /><Stat label="已掌握命令" value={progress.commands} /><Stat label="故障场景" value={progress.scenarios} /><Stat label="收藏表达" value={progress.expressions} /><Stat label="实验记录" value={progress.notes} /></section>
    <section className="section-head"><div><p>LEARNING MODULES</p><h2>按真实工作场景训练</h2></div></section><section className="module-grid">{cards.map(([id, title, desc], index) => <button className="module-card" key={id} onClick={() => navigate(id)}><span>0{index + 1}</span><strong>{title}</strong><small>{desc}</small><b>进入模块 →</b></button>)}</section>
    <section className="route"><div><p>PATH</p><h2>从基础命令到 DevOps</h2></div><ol>{["Linux 基础","网络与服务排障","Shell 基础","Docker","K3s / Kubernetes","CI/CD","监控与日志","DevOps 实战"].map((step, index) => <li key={step}><span>{index + 1}</span>{step}</li>)}</ol></section>
  </>;
}
function ProgressBar({ value, max }) { return <div className="progress-track"><span style={{ width: `${Math.min(100, Math.round(value / max * 100))}%` }}></span></div>; }
function Stat({ label, value }) { return <div><strong>{value}</strong><span>{label}</span></div>; }

function Commands({ favorites, refresh }) {
  const [search, setSearch] = useState(""); const [category, setCategory] = useState("全部"); const [expanded, setExpanded] = useState(null);
  const categories = ["全部", ...new Set(commands.map(item => item.category))];
  const visible = commands.filter(item => (category === "全部" || item.category === category) && `${item.name} ${item.purpose} ${item.scenario}`.toLowerCase().includes(search.toLowerCase()));
  const toggle = id => { storage.toggle(storage.keys.commands, id); refresh(); };
  return <><ModuleTitle kicker="LINUX FUNDAMENTALS" title="Linux 基础命令"><p>每张卡片都链接到一个真实的运维工作场景。</p></ModuleTitle><div className="filters"><input value={search} onChange={event => setSearch(event.target.value)} placeholder="搜索命令、用途或场景" />{categories.map(item => <button className={category === item ? "selected" : ""} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div><p className="result-count">显示 {visible.length} 个命令</p><section className="command-grid">{visible.map(command => <article className="command-card" key={command.id}><header><div><Tag>{command.category}</Tag><h3>{command.name}</h3></div><button className={favorites.includes(command.id) ? "favorite on" : "favorite"} onClick={() => toggle(command.id)} aria-label="收藏命令">★</button></header><p>{command.purpose}</p><TerminalBlock commandsText={command.example} title="示例命令" /><p className="context"><b>真实场景：</b>{command.scenario}</p><button className="text-button" onClick={() => setExpanded(expanded === command.id ? null : command.id)}>{expanded === command.id ? "收起说明" : "展开详情"}</button>{expanded === command.id && <div className="details"><p><b>常见参数：</b>{command.params}</p><p><b>注意：</b>{command.error}</p><p><b>英文：</b>{command.english}</p></div>}</article>)}</section></>;
}

function Troubleshooting({ refresh }) {
  const [difficulty, setDifficulty] = useState("全部"); const [tag, setTag] = useState("全部"); const [answers, setAnswers] = useState({}); const mastered = storage.scenarios();
  const tags = ["全部", ...new Set(scenarios.flatMap(item => item.tags))]; const visible = scenarios.filter(item => (difficulty === "全部" || item.difficulty === difficulty) && (tag === "全部" || item.tags.includes(tag)));
  const mark = id => { storage.toggle(storage.keys.scenarios, id); refresh(); };
  return <><ModuleTitle kicker="INCIDENT RESPONSE" title="Linux 故障排查"><p>先形成排障顺序，再记住命令。</p></ModuleTitle><div className="filters"><select value={difficulty} onChange={event => setDifficulty(event.target.value)}>{["全部","Beginner","Intermediate","Advanced"].map(item => <option key={item}>{item}</option>)}</select>{tags.map(item => <button className={tag === item ? "selected" : ""} key={item} onClick={() => setTag(item)}>{item}</button>)}</div><section className="scenario-grid">{visible.map(scenario => <article className="scenario-card" key={scenario.id}><header><div><Tag kind={scenario.difficulty === "Beginner" ? "green" : scenario.difficulty === "Advanced" ? "red" : "amber"}>{scenario.difficulty}</Tag><h3>{scenario.title}</h3></div><button className={mastered.includes(scenario.id) ? "complete active" : "complete"} onClick={() => mark(scenario.id)}>{mastered.includes(scenario.id) ? "已掌握" : "标记掌握"}</button></header><p className="symptom">{scenario.symptom}</p><p><b>问题：</b>{scenario.question}</p><div className="options">{scenario.options.map((option, index) => <button key={option} className={answers[scenario.id] !== undefined ? (index === scenario.correct ? "right" : index === answers[scenario.id] ? "wrong" : "") : ""} onClick={() => setAnswers({ ...answers, [scenario.id]: index })}>{"ABCD"[index]}. {option}</button>)}</div>{answers[scenario.id] !== undefined && <div className={answers[scenario.id] === scenario.correct ? "feedback good" : "feedback bad"}><b>{answers[scenario.id] === scenario.correct ? "思路正确" : "再想一想"}</b><p>{scenario.explanation}</p></div>}<TerminalBlock commandsText={scenario.commandsText} title="推荐排查命令" /><p className="english-line">{scenario.english}</p></article>)}</section></>;
}

function Network() { const flow = ["能 ping 通服务器吗？","DNS 能解析吗？","端口是否开放？","服务是否监听？","本机 curl 是否成功？","防火墙是否阻止？","日志是否有错误？"]; return <><ModuleTitle kicker="NETWORK TROUBLESHOOTING" title="网络诊断"><p>面对“网站打不开”，按顺序排查，不跳步骤。</p></ModuleTitle><section className="flow-card"><div><p>CASE FLOW</p><h2>网站无法访问</h2></div><ol>{flow.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2,"0")}</span><strong>{step}</strong></li>)}</ol></section><section className="two-column"><TerminalBlock title="网络诊断工具箱" commandsText={"ip addr\nip route\nping -c 4 server\ndig example.com\nss -lntp\ncurl -I http://127.0.0.1:8080\nfirewall-cmd --list-all"} /><article className="info-card"><Tag>WORK TICKET</Tag><h3>英文表达</h3><p>I checked DNS resolution, network connectivity, and port availability.</p><p>The server was reachable, but the application port was not listening.</p></article></section></> }
function Systemd() { return <><ModuleTitle kicker="SERVICE MANAGEMENT" title="Systemd 服务管理"><p>用 status、journalctl 和配置校验定位服务失败原因。</p></ModuleTitle><section className="process-card"><h2>Nginx 启动失败排查流程</h2>{["systemctl status nginx","nginx -t","journalctl -u nginx -n 50","检查端口占用","检查配置文件与权限"].map((step, index) => <div key={step}><span>{index + 1}</span><strong>{step}</strong></div>)}</section><TerminalBlock title="服务排查模拟终端" commandsText={"systemctl status nginx\nsystemctl restart nginx\njournalctl -u nginx -n 100\njournalctl -u nginx -f\nsystemctl enable nginx"} /></> }

function Labs({ title, kicker, labs, refresh }) { const done = storage.labs(); const toggle = id => { storage.toggle(storage.keys.labs, id); refresh(); }; return <><ModuleTitle kicker={kicker} title={title}><p>全部为模拟实验步骤，不会连接或修改真实环境。</p></ModuleTitle><section className="lab-grid">{labs.map((lab, index) => <article className="lab-card" key={lab.id}><span>LAB {String(index + 1).padStart(2, "0")}</span><h3>{lab.title}</h3><p>{lab.use}</p><TerminalBlock commandsText={lab.commandsText} /><button className={done.includes(lab.id) ? "complete active" : "complete"} onClick={() => toggle(lab.id)}>{done.includes(lab.id) ? "已完成实验" : "标记为完成"}</button></article>)}</section></> }

function Roadmap({ refresh }) { const current = storage.stage(); return <><ModuleTitle kicker="CAREER ROADMAP" title="DevOps 路线图"><p>一条能做、能记录、能展示的学习路径。</p></ModuleTitle><section className="roadmap">{roadmap.map((stage, index) => <article className={current === stage.title ? "current" : ""} key={stage.id}><span>{String(index + 1).padStart(2,"0")}</span><div><h3>{stage.title}</h3><p>{stage.goal}</p><small>本阶段任务：{stage.task}</small></div><button onClick={() => { storage.set(storage.keys.stage, stage.title); refresh(); }}>设为当前</button></article>)}</section></> }

function English({ saved, refresh }) { const [search, setSearch] = useState(""); const [category, setCategory] = useState("全部"); const [message, setMessage] = useState(""); const categories = ["全部", ...new Set(expressions.map(item => item.category))]; const visible = expressions.filter(item => (category === "全部" || item.category === category) && `${item.chinese} ${item.english}`.toLowerCase().includes(search.toLowerCase())); const toggle = id => { storage.toggle(storage.keys.expressions, id); refresh(); }; return <><ModuleTitle kicker="IT SUPPORT ENGLISH" title="英文工单表达"><p>把技术问题说清楚，也是运维能力的一部分。</p></ModuleTitle><div className="filters"><input value={search} onChange={event => setSearch(event.target.value)} placeholder="搜索中文或英文表达" />{categories.map(item => <button className={category === item ? "selected" : ""} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div><section className="expression-grid">{visible.map(item => <article key={item.id}><header><Tag>{item.category}</Tag><button className={saved.includes(item.id) ? "favorite on" : "favorite"} onClick={() => toggle(item.id)}>★</button></header><p className="cn">{item.chinese}</p><p className="en">{item.english}</p><small>{item.keywords}</small><button className="copy-expression" onClick={() => copy(item.english, setMessage)}>复制英文</button></article>)}</section>{message && <div className="toast">{message}</div>}</> }

function Notes({ refresh }) { const [editing, setEditing] = useState(null); const notes = storage.notes(); const empty = { title:"", direction:"Linux", goal:"", steps:"", problem:"", solution:"", english:"", article:false }; const [form, setForm] = useState(empty); const save = event => { event.preventDefault(); if (!form.title.trim()) return; const generatedId = crypto.randomUUID?.() || `note-${Date.now()}-${Math.random().toString(16).slice(2)}`; const item = { ...form, id: editing || generatedId, date: new Date().toLocaleDateString("en-CA") }; storage.set(storage.keys.notes, editing ? notes.map(note => note.id === editing ? item : note) : [item, ...notes]); setForm(empty); setEditing(null); refresh(); }; const edit = note => { setEditing(note.id); setForm(note); }; const remove = id => { if (confirm("删除这条实验记录？")) { storage.set(storage.keys.notes, notes.filter(note => note.id !== id)); refresh(); } }; const md = note => `# ${note.title}\n\n日期：${note.date}\n\n技术方向：${note.direction}\n\n## 实验目标\n${note.goal}\n\n## 实验步骤\n${note.steps}\n\n## 遇到的问题\n${note.problem}\n\n## 解决方法\n${note.solution}\n\n## 英文表达\n${note.english}\n\n## 总结\n${note.article ? "可整理为公众号文章。" : "待继续完善。"}\n`; const download = note => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([md(note)], { type:"text/markdown" })); a.download = `${note.title}.md`; a.click(); URL.revokeObjectURL(a.href); }; return <><ModuleTitle kicker="PERSONAL PORTFOLIO" title="我的实验记录"><p>记录实验、问题与解决方案，慢慢变成你的技术作品集。</p></ModuleTitle><section className="notes-layout"><form className="note-form" onSubmit={save}><h2>{editing ? "编辑实验记录" : "新增实验记录"}</h2><input value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder="实验标题" required /><select value={form.direction} onChange={e => setForm({...form,direction:e.target.value})}>{["Linux","Docker","K3s / Kubernetes","Network","Systemd","DevOps"].map(v => <option key={v}>{v}</option>)}</select>{[["goal","实验目标"],["steps","实验步骤"],["problem","遇到的问题"],["solution","解决方法"],["english","学到的英文表达"]].map(([key,label]) => <textarea key={key} value={form[key]} onChange={e => setForm({...form,[key]:e.target.value})} placeholder={label} rows="3" />)}<label className="check"><input type="checkbox" checked={form.article} onChange={e => setForm({...form,article:e.target.checked})} /> 可写成公众号文章</label><button>保存记录</button>{editing && <button type="button" className="secondary" onClick={() => { setEditing(null); setForm(empty); }}>取消编辑</button>}</form><div className="note-list">{notes.length ? notes.map(note => <article key={note.id}><Tag>{note.direction}</Tag><h3>{note.title}</h3><small>{note.date}</small><p>{note.goal || "未填写目标"}</p><div><button onClick={() => edit(note)}>编辑</button><button onClick={() => copy(md(note), () => {})}>复制 Markdown</button><button onClick={() => download(note)}>导出 .md</button><button className="danger" onClick={() => remove(note.id)}>删除</button></div></article>) : <div className="empty">还没有实验记录。从一次 Linux 或 Docker 练习开始吧。</div>}</div></section></> }

function Deploy() { return <><ModuleTitle kicker="GITHUB PAGES" title="GitHub / 部署说明"><p>本站是静态 React 学习站，适合直接作为技术作品集发布。</p></ModuleTitle><section className="deploy-grid"><article><h3>本地运行</h3><TerminalBlock commandsText={"npm install\nnpm run dev\n# http://127.0.0.1:8767"} /></article><article><h3>构建预览</h3><TerminalBlock commandsText={"npm run build\nnpm run preview"} /></article><article><h3>自动部署</h3><p>项目已包含 GitHub Actions 工作流。推送到 main 后会构建 dist 并发布到 GitHub Pages。</p><Tag kind="green">STATIC ONLY</Tag></article></section></> }

function Quiz({ close, refresh }) { const [index, setIndex] = useState(0); const [answer, setAnswer] = useState(null); const question = quizQuestions[index]; const next = () => { if (answer === question.correct) storage.set(storage.keys.quiz, [...storage.quizzes(), { id: question.id, at: Date.now() }]); if (index === quizQuestions.length - 1) { refresh(); close(); } else { setIndex(index + 1); setAnswer(null); } }; return <div className="modal-backdrop"><section className="quiz-modal"><button className="close" onClick={close}>×</button><p>QUICK CHECK · {index + 1}/{quizQuestions.length}</p><Tag>{question.category}</Tag><h2>{question.question}</h2><div className="options">{question.options.map((option, optionIndex) => <button key={option} disabled={answer !== null} className={answer !== null ? (optionIndex === question.correct ? "right" : optionIndex === answer ? "wrong" : "") : ""} onClick={() => setAnswer(optionIndex)}>{"ABCD"[optionIndex]}. {option}</button>)}</div>{answer !== null && <div className={answer === question.correct ? "feedback good" : "feedback bad"}><b>{answer === question.correct ? "回答正确" : "正确答案已标出"}</b><p>{question.explanation}</p><button onClick={next}>{index === quizQuestions.length - 1 ? "完成测验" : "下一题"}</button></div>}</section></div> }

export default App;
