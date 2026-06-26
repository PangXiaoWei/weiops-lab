export const commandSeed = [
  ["ls","文件与目录","列出目录内容","ls -lah","查看部署目录里是否有配置文件"], ["cd","文件与目录","进入目录","cd /var/log","进入服务日志目录"], ["pwd","文件与目录","显示当前路径","pwd","确认当前工作目录"], ["mkdir","文件与目录","创建目录","mkdir -p /opt/app/logs","准备应用目录"], ["touch","文件与目录","创建空文件","touch app.log","创建测试日志"], ["cp","文件与目录","复制文件","cp nginx.conf nginx.conf.bak","备份配置"], ["mv","文件与目录","移动或重命名","mv app.log app.log.1","轮转日志"], ["rm","文件与目录","删除文件","rm -i old.log","谨慎清理文件"],
  ["cat","查看文本","快速显示文件","cat /etc/hosts","查看 hosts 配置"], ["less","查看文本","分页查看文本","less /var/log/syslog","阅读长日志"], ["head","查看文本","查看文件开头","head -n 20 access.log","检查日志格式"], ["tail","查看文本","查看文件末尾","tail -f app.log","实时观察应用日志"],
  ["grep","搜索与过滤","过滤匹配内容","grep -i error app.log","查找错误日志"], ["find","搜索与过滤","按条件查找文件","find /var/log -name '*.log'","定位日志文件"], ["awk","搜索与过滤","处理列数据","awk '{print $1}' access.log","提取访问 IP"], ["sed","搜索与过滤","文本替换与编辑","sed -n '1,20p' app.conf","检查配置片段"],
  ["chmod","权限管理","修改权限","chmod 640 app.conf","收紧配置权限"], ["chown","权限管理","修改所有者","chown nginx:nginx /srv/site","修复站点权限"],
  ["ps","进程管理","查看进程","ps aux | grep nginx","确认进程存在"], ["top","进程管理","查看资源占用","top","排查 CPU 过高"], ["htop","进程管理","交互式进程查看","htop","快速定位异常进程"], ["kill","进程管理","结束进程","kill -TERM 1234","优雅停止异常进程"],
  ["df -h","磁盘空间","查看文件系统空间","df -h","排查磁盘已满"], ["du -sh","磁盘空间","统计目录大小","du -sh /var/log/*","找出大日志"], ["free -h","系统信息","查看内存","free -h","确认内存压力"], ["uptime","系统信息","查看负载与运行时间","uptime","判断系统负载"], ["uname -a","系统信息","查看内核信息","uname -a","确认系统版本"],
  ["ip addr","网络","查看网卡地址","ip addr","确认服务器 IP"], ["ping","网络","测试连通性","ping -c 4 8.8.8.8","验证网络可达"], ["curl","网络","发送 HTTP 请求","curl -I http://127.0.0.1:8080","验证本机服务"], ["wget","网络","下载或测试资源","wget -S -O- https://example.com","检查下载响应"], ["ss -lntp","网络","查看监听端口","ss -lntp","确认端口监听"], ["netstat","网络","旧式端口查看","netstat -lntp","遗留系统排查"],
  ["tar","压缩与解压","打包与解压","tar -czf backup.tgz /etc/nginx","备份配置"], ["systemctl","服务管理","管理 systemd 服务","systemctl status nginx","确认服务状态"], ["journalctl","日志查看","查看 systemd 日志","journalctl -u nginx -n 50","查看服务失败原因"], ["ssh","远程连接","登录远程主机","ssh user@server","远程运维"], ["scp","远程连接","复制远程文件","scp app.conf user@server:/tmp","传递配置文件"]
];

export const commands = commandSeed.map(([name, category, purpose, example, scenario]) => ({
  id: name.replace(/[^a-z0-9]/gi, "-"), name, category, purpose, example, scenario,
  params: "常用参数请结合 man 手册确认", error: "生产环境操作前先确认目标路径与影响范围。",
  english: `I used ${name} to investigate the issue and verified the result.`
}));

const scenarioSeed = [
  ["网站打不开","用户无法访问 http://server:8080","systemd, network, firewall","Beginner","服务是否运行？","systemctl status nginx\nss -lntp | grep 8080\ncurl -I http://127.0.0.1:8080","The website was not accessible. I first checked the service and port listener."],
  ["服务启动失败","启动 nginx 后立即失败","systemd, nginx","Beginner","先查看什么？","systemctl status nginx\nnginx -t\njournalctl -u nginx -n 50","The service failed to start, so I checked its status and logs."],
  ["端口被占用","服务提示 address already in use","network, systemd","Beginner","第一步？","ss -lntp | grep 8080\nps aux | grep 8080","I found that the port was already in use."],
  ["磁盘空间满了","应用无法写入日志","disk","Beginner","先检查什么？","df -h\ndu -sh /var/log/*\njournalctl --vacuum-time=7d","The /var partition was almost full."],
  ["CPU 使用率过高","系统响应变慢","system","Intermediate","先定位什么？","top\nps aux --sort=-%cpu | head","I identified the process consuming high CPU."],
  ["内存不足","进程被 OOM 杀死","system","Intermediate","先检查什么？","free -h\ndmesg | grep -i oom","The host was under memory pressure."],
  ["日志文件太大","磁盘不断增长","disk, logs","Beginner","正确思路？","du -sh /var/log/*\nlogrotate -d /etc/logrotate.conf","I found an oversized log file."],
  ["Permission denied","应用无法读取文件","permission","Beginner","先验证什么？","ls -lah /srv/app\nnamei -l /srv/app/config.yml","The issue may be related to permission settings."],
  ["SSH 无法登录","远程连接被拒绝","ssh, network","Intermediate","先检查什么？","systemctl status ssh\nss -lntp | grep :22\njournalctl -u ssh -n 50","I checked the SSH service and port 22."],
  ["DNS 解析失败","域名无法转换为 IP","network","Beginner","先检查什么？","dig example.com\ncat /etc/resolv.conf","I checked DNS resolution and network connectivity."],
  ["Docker 容器启动失败","容器退出码非零","docker","Intermediate","先查看什么？","docker ps -a\ndocker logs web-demo\ndocker inspect web-demo","I checked the container logs and exit code."],
  ["Nginx 配置错误","修改配置后重启失败","nginx, systemd","Intermediate","第一步？","nginx -t\nsystemctl status nginx","The Nginx configuration test reported an error."],
  ["服务器时间不正确","证书或日志时间异常","system","Beginner","检查命令？","timedatectl status\nchronyc tracking","I verified the system time synchronization."],
  ["服务反复重启","systemd 不断重试","systemd","Advanced","先检查什么？","systemctl status app\njournalctl -u app -n 100","The service was restarting repeatedly, so I reviewed the failure logs."],
  ["防火墙阻止访问","本机正常，外部不通","network, firewall","Intermediate","正确顺序？","curl -I http://127.0.0.1:8080\nfirewall-cmd --list-all\nss -lntp","The service was listening locally, but the firewall blocked external access."]
];

export const scenarios = scenarioSeed.map(([title, symptom, tags, difficulty, question, commandsText, english], index) => ({
  id: `scenario-${index + 1}`, title, symptom, tags: tags.split(", "), difficulty, question,
  options: ["查看服务是否启动和端口是否监听", "删除项目重新部署", "重启电脑", "修改 root 密码"], correct: 0,
  explanation: "先验证服务状态、端口监听和本机访问，能最快缩小故障范围。", commandsText, english
}));

export const dockerLabs = [
  ["部署 Nginx 容器", "docker run -d --name web-demo -p 8080:80 nginx\ndocker ps\ncurl http://127.0.0.1:8080"],
  ["查看容器日志", "docker logs web-demo\ndocker logs -f web-demo"],
  ["进入容器排查", "docker exec -it web-demo sh\ncat /etc/nginx/nginx.conf"],
  ["端口映射排查", "docker ps\ndocker port web-demo\ncurl -I http://127.0.0.1:8080"],
  ["Volume 挂载实验", "docker run --rm -v $(pwd):/data alpine ls /data"],
  ["Compose 启动服务", "docker compose up -d\ndocker compose logs"]
].map(([title, commandsText], index) => ({ id: `docker-${index + 1}`, title, commandsText, use: "用于容器部署、验证与故障排查的模拟步骤。" }));

export const k3sLabs = [
  ["查看集群节点", "kubectl get nodes"], ["部署 Nginx", "kubectl create deployment web --image=nginx\nkubectl get deploy"], ["查看 Pod 状态", "kubectl get pods -o wide\nkubectl describe pod <pod-name>"], ["暴露 Service", "kubectl expose deployment web --port=80 --type=ClusterIP\nkubectl get svc"], ["查看 Pod 日志", "kubectl logs <pod-name>\nkubectl get events --sort-by=.lastTimestamp"], ["排查 ImagePullBackOff", "kubectl describe pod <pod-name>\nkubectl get events"]
].map(([title, commandsText], index) => ({ id: `k3s-${index + 1}`, title, commandsText, use: "K3s/Kubernetes 学习模拟，不会连接真实集群。" }));

export const englishTickets = [
  ["服务故障","服务启动失败，我检查了日志，发现端口被占用。","The service failed to start. I checked the logs and found that the port was already in use."], ["服务故障","我已经重启了服务，现在网站可以正常访问。","I restarted the service, and the website is now accessible."], ["网络问题","我正在检查 DNS 解析和网络连接。","I am checking DNS resolution and network connectivity."], ["权限问题","这个问题可能和权限配置有关。","This issue may be related to permission settings."], ["磁盘问题","/var 分区几乎满了。","The /var partition was almost full."], ["账号问题","我已确认该账户没有所需权限。","I confirmed that the account does not have the required permission."], ["部署问题","部署已完成，正在验证服务健康状态。","The deployment is complete, and I am validating the service health."], ["Docker 问题","容器没有启动，我正在检查日志和退出码。","The container did not start, and I am checking the logs and exit code."], ["Kubernetes 问题","Pod 无法拉取镜像。","The pod failed because Kubernetes could not pull the image."], ["日志分析","日志显示配置文件存在语法错误。","The logs show that the configuration file contains a syntax error."], ["处理完成","问题已解决，我会继续监控服务。","The issue has been resolved, and I will continue to monitor the service."]
];
export const expressions = Array.from({ length: 30 }, (_, index) => { const base = englishTickets[index % englishTickets.length]; return { id: `expression-${index + 1}`, category: base[0], chinese: base[1], english: base[2], keywords: base[2].split(" ").slice(0, 5).join(" · ") }; });

export const roadmap = [
  ["阶段一：Linux 基础", "文件系统、权限、进程、网络、systemd、日志", "完成 10 个命令场景并写一篇磁盘排查记录"], ["阶段二：Shell 与自动化", "变量、条件、循环、cron、简单脚本", "写一个日志检查脚本"], ["阶段三：Docker", "image、container、volume、network、compose", "部署并排查一个 Nginx 容器"], ["阶段四：K3s / Kubernetes", "pod、deployment、service、ingress、events", "完成 Pod 状态排查"], ["阶段五：CI/CD", "Git、GitHub Actions、build、test、deploy", "为本站配置自动部署"], ["阶段六：监控与日志", "Prometheus、Grafana、Loki、ELK 基础", "画出一条日志链路"], ["阶段七：英文工作表达", "工单、故障报告、变更说明、邮件沟通", "整理十条自己的工作表达"]
].map(([title, goal, task], index) => ({ id: `stage-${index + 1}`, title, goal, task }));

export const quizQuestions = [
  { id: "quiz-1", category: "Linux", question: "服务器磁盘空间满了，首先应该使用哪个命令？", options: ["df -h", "rm -rf /", "reboot", "passwd"], correct: 0, explanation: "df -h 用于快速确认各文件系统的磁盘使用率。" },
  { id: "quiz-2", category: "故障排查", question: "网站无法访问时，合理的第一步是什么？", options: ["确认服务与端口监听", "直接删库", "修改 root 密码", "重装系统"], correct: 0, explanation: "先验证服务、监听端口和本机访问，避免盲目修改。" },
  { id: "quiz-3", category: "Docker", question: "查看容器日志应使用？", options: ["docker logs <container>", "docker delete", "kubectl logs", "systemctl logs"], correct: 0, explanation: "docker logs 是容器日志排查的入口。" },
  { id: "quiz-4", category: "Kubernetes", question: "Pod 出现 ImagePullBackOff，优先检查？", options: ["镜像名称与事件", "删除 Kubernetes", "重启电脑", "修改 SSH 密码"], correct: 0, explanation: "describe pod 和 events 能揭示镜像拉取失败原因。" }
];
