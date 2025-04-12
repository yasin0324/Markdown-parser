// 页面加载完成后执行
document.addEventListener("DOMContentLoaded", function () {
    // 获取DOM元素
    const markdownInput = document.getElementById("markdownInput");
    const preview = document.getElementById("preview");
    const clearButton = document.getElementById("clearButton");
    const copyMarkdownButton = document.getElementById("copyMarkdownButton");
    const copyHtmlButton = document.getElementById("copyHtmlButton");
    const downloadButton = document.getElementById("downloadButton");
    const themeToggle = document.getElementById("themeToggle");
    const aboutLink = document.getElementById("aboutLink");
    const aboutDialog = document.getElementById("aboutDialog");
    const closeDialog = document.querySelector(".close-dialog");

    // 初始化主题
    initTheme();

    // 添加示例Markdown文本
    const exampleMarkdown = `# Markdown解析器示例

欢迎使用这个简单的**Markdown解析器**！

## 基本语法

### 文本格式化

你可以使用 **粗体** 或者 *斜体* 来强调文本。
也可以使用 ~~删除线~~ 表示删除的内容。

### 列表

无序列表：
- 项目1
- 项目2
- 项目3

有序列表：
1. 第一步
2. 第二步
3. 第三步

### 链接和图片

[点击这里访问GitHub](https://github.com)

![Markdown Logo](https://markdown-here.com/img/icon256.png)

### 引用

> 这是一段引用文本。
> 引用可以有多行。

### 代码

行内代码：\`const x = 10;\`

代码块：
\`\`\`javascript
function hello() {
    console.log("Hello, Markdown!");
}
\`\`\`

### 表格

| 姓名 | 年龄 | 职业 |
| ---- | ---- | ---- |
| 张三 | 25 | 工程师 |
| 李四 | 30 | 设计师 |

### 水平线

---

## 开始使用

现在，你可以在左侧编辑器中输入任何Markdown文本，右侧将实时显示渲染结果！`;

    markdownInput.value = exampleMarkdown;

    // 初始渲染
    renderMarkdown();

    // 监听输入事件，实时渲染Markdown
    markdownInput.addEventListener("input", renderMarkdown);

    // 清空编辑器
    clearButton.addEventListener("click", function () {
        markdownInput.value = "";
        renderMarkdown();
    });

    // 复制Markdown文本
    copyMarkdownButton.addEventListener("click", function () {
        copyToClipboard(markdownInput.value, "Markdown文本已复制到剪贴板！");
    });

    // 复制HTML代码
    copyHtmlButton.addEventListener("click", function () {
        copyToClipboard(preview.innerHTML, "HTML代码已复制到剪贴板！");
    });

    // 下载HTML文件
    downloadButton.addEventListener("click", function () {
        downloadHtml();
    });

    // 切换主题
    themeToggle.addEventListener("click", function () {
        toggleTheme();
    });

    // 显示关于对话框
    aboutLink.addEventListener("click", function (e) {
        e.preventDefault();
        aboutDialog.style.display = "block";
    });

    // 关闭对话框
    closeDialog.addEventListener("click", function () {
        aboutDialog.style.display = "none";
    });

    // 点击对话框外部关闭对话框
    window.addEventListener("click", function (e) {
        if (e.target === aboutDialog) {
            aboutDialog.style.display = "none";
        }
    });

    // 渲染Markdown函数
    function renderMarkdown() {
        const markdown = markdownInput.value;
        const html = parseMarkdown(markdown);
        preview.innerHTML = html;

        // 处理代码高亮
        document.querySelectorAll("pre code").forEach((block) => {
            highlightCode(block);
        });
    }

    // Markdown解析函数
    function parseMarkdown(markdown) {
        let html = markdown;

        // 转义HTML特殊字符
        html = escapeHtml(html);

        // 解析代码块 (```code```)
        html = html.replace(/```([\s\S]*?)```/g, function (match, code) {
            // 检查是否有语言标识
            const firstLine = code.split("\n")[0].trim();
            let language = "";
            let codeContent = code;

            if (
                firstLine &&
                !firstLine.includes(" ") &&
                firstLine.length < 20
            ) {
                language = firstLine;
                codeContent = code.substring(firstLine.length).trim();
            }

            return `<pre><code class="language-${language}">${codeContent}</code></pre>`;
        });

        // 解析行内代码 (`code`)
        html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

        // 解析标题 (# Heading)
        html = html.replace(
            /^(#{1,6})\s+(.+)$/gm,
            function (match, hashes, heading) {
                const level = hashes.length;
                return `<h${level}>${heading}</h${level}>`;
            }
        );

        // 解析粗体 (**text**)
        html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

        // 解析斜体 (*text*)
        html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");

        // 解析删除线 (~~text~~)
        html = html.replace(/~~([^~]+)~~/g, "<del>$1</del>");

        // 解析链接 ([text](url))
        html = html.replace(
            /\[([^\]]+)\]\(([^)]+)\)/g,
            '<a href="$2" target="_blank">$1</a>'
        );

        // 解析图片 (![alt](url))
        html = html.replace(
            /!\[([^\]]+)\]\(([^)]+)\)/g,
            '<img src="$2" alt="$1">'
        );

        // 解析无序列表
        html = parseUnorderedLists(html);

        // 解析有序列表
        html = parseOrderedLists(html);

        // 解析引用 (> text)
        html = parseBlockquotes(html);

        // 解析表格
        html = parseTables(html);

        // 解析水平线 (---)
        html = html.replace(/^(---|\*\*\*|___)$/gm, "<hr>");

        // 解析段落
        html = parseParagraphs(html);

        return html;
    }

    // 转义HTML特殊字符
    function escapeHtml(text) {
        const map = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;",
        };
        return text.replace(/[&<>"']/g, function (m) {
            return map[m];
        });
    }

    // 解析无序列表
    function parseUnorderedLists(html) {
        // 匹配无序列表块
        return html.replace(/((^|\n)- [^\n]+)+/g, function (match) {
            // 将每一行转换为列表项
            const items = match.split(/\n- /).filter(Boolean);
            const listItems = items
                .map((item) => `<li>${item.replace(/^- /, "")}</li>`)
                .join("");
            return `<ul>${listItems}</ul>`;
        });
    }

    // 解析有序列表
    function parseOrderedLists(html) {
        // 匹配有序列表块
        return html.replace(/((^|\n)\d+\. [^\n]+)+/g, function (match) {
            // 将每一行转换为列表项
            const items = match.split(/\n\d+\. /).filter(Boolean);
            const listItems = items
                .map((item) => `<li>${item.replace(/^\d+\. /, "")}</li>`)
                .join("");
            return `<ol>${listItems}</ol>`;
        });
    }

    // 解析引用块
    function parseBlockquotes(html) {
        // 匹配引用块
        return html.replace(/((^|\n)> [^\n]+)+/g, function (match) {
            // 将每一行转换为引用内容
            const content = match.replace(/^> |\n> /g, "\n").trim();
            return `<blockquote>${content}</blockquote>`;
        });
    }

    // 解析表格
    function parseTables(html) {
        // 匹配表格
        return html.replace(
            /^\|(.+)\|\s*\n\|\s*[-:]+[-| :]*\s*\|\s*\n((\|.+\|\s*\n)+)/gm,
            function (match, header, rows) {
                // 解析表头
                const headers = header
                    .split("|")
                    .map((cell) => cell.trim())
                    .filter(Boolean);
                const headerRow = `<tr>${headers
                    .map((cell) => `<th>${cell}</th>`)
                    .join("")}</tr>`;

                // 解析表格行
                const tableRows = rows
                    .trim()
                    .split("\n")
                    .map((row) => {
                        const cells = row
                            .split("|")
                            .map((cell) => cell.trim())
                            .filter(Boolean);
                        return `<tr>${cells
                            .map((cell) => `<td>${cell}</td>`)
                            .join("")}</tr>`;
                    })
                    .join("");

                return `<table><thead>${headerRow}</thead><tbody>${tableRows}</tbody></table>`;
            }
        );
    }

    // 解析段落
    function parseParagraphs(html) {
        // 将连续的非空行包装为段落
        const lines = html.split("\n");
        let result = "";
        let inParagraph = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const isEmptyLine = line.trim() === "";
            const isListItem = line.match(/^<li>/);
            const isBlockElement = line.match(
                /^<(\/?(h[1-6]|ul|ol|li|blockquote|pre|table|thead|tbody|tr|th|td|hr))/
            );

            if (isEmptyLine) {
                if (inParagraph) {
                    result += "</p>\n";
                    inParagraph = false;
                }
                result += "\n";
            } else if (isBlockElement || isListItem) {
                if (inParagraph) {
                    result += "</p>\n";
                    inParagraph = false;
                }
                result += line + "\n";
            } else {
                if (!inParagraph) {
                    result += "<p>";
                    inParagraph = true;
                } else {
                    result += " ";
                }
                result += line;
            }
        }

        if (inParagraph) {
            result += "</p>";
        }

        return result;
    }

    // 简单的代码高亮函数
    function highlightCode(block) {
        const code = block.textContent;
        let highlighted = code;

        // 获取语言类
        const language = block.className.replace("language-", "");

        // 根据不同语言应用不同的高亮规则
        if (language === "javascript" || language === "js") {
            // 关键字高亮
            highlighted = highlighted.replace(
                /\b(const|let|var|function|return|if|else|for|while|class|new|this|import|export)\b/g,
                '<span class="keyword">$1</span>'
            );
            // 字符串高亮
            highlighted = highlighted.replace(
                /(["'])(.*?)\1/g,
                '<span class="string">$1$2$1</span>'
            );
            // 注释高亮
            highlighted = highlighted.replace(
                /\/\/(.*)$/gm,
                '<span class="comment">//$1</span>'
            );
        } else if (language === "html") {
            // 标签高亮
            highlighted = highlighted.replace(
                /(&lt;\/?)(\w+)([^&]*?)(&gt;)/g,
                '$1<span class="keyword">$2</span>$3$4'
            );
            // 属性高亮
            highlighted = highlighted.replace(
                /\s(\w+)=(["'])(.*?)\2/g,
                ' <span class="attr">$1</span>=<span class="string">$2$3$2</span>'
            );
        } else if (language === "css") {
            // 选择器高亮
            highlighted = highlighted.replace(
                /([\w\.-]+)\s*\{/g,
                '<span class="selector">$1</span> {'
            );
            // 属性高亮
            highlighted = highlighted.replace(
                /([\w-]+)\s*:/g,
                '<span class="property">$1</span>:'
            );
            // 值高亮
            highlighted = highlighted.replace(
                /:\s*([^;\{]+);/g,
                ': <span class="value">$1</span>;'
            );
        }

        // 添加行号
        const lines = highlighted.split("\n");
        highlighted = lines
            .map((line, index) => {
                return `<span class="line-number">${index + 1}</span>${line}`;
            })
            .join("\n");

        // 更新代码块内容
        block.innerHTML = highlighted;

        // 添加代码高亮样式
        const style = document.createElement("style");
        style.textContent = `
            pre {
                position: relative;
                padding-left: 3.5em;
                counter-reset: line;
            }
            pre code {
                display: block;
                font-family: 'Consolas', monospace;
                white-space: pre;
                overflow-x: auto;
            }
            .line-number {
                position: absolute;
                left: 0;
                width: 2.5em;
                text-align: right;
                color: #888;
                user-select: none;
                padding-right: 0.5em;
                border-right: 1px solid #ddd;
                margin-right: 0.5em;
            }
            .keyword { color: #07a; }
            .string { color: #690; }
            .comment { color: #999; }
            .selector { color: #905; }
            .property { color: #07a; }
            .value { color: #690; }
            .attr { color: #07a; }
        `;

        if (!document.querySelector("style[data-highlight]")) {
            style.setAttribute("data-highlight", "true");
            document.head.appendChild(style);
        }
    }

    // 复制到剪贴板函数
    function copyToClipboard(text, message) {
        navigator.clipboard.writeText(text).then(
            function () {
                showNotification(message);
            },
            function () {
                showNotification("复制失败，请手动复制。");
            }
        );
    }

    // 下载HTML文件
    function downloadHtml() {
        const markdown = markdownInput.value;
        const title = markdown.match(/^# (.+)$/m)
            ? markdown.match(/^# (.+)$/m)[1]
            : "Markdown文档";

        const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        h1, h2, h3, h4, h5, h6 {
            color: #4b5eff;
            margin-top: 1em;
            margin-bottom: 0.5em;
        }
        h1 {
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 0.3em;
        }
        h2 {
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 0.2em;
        }
        a {
            color: #4b5eff;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 1em 0;
            border-radius: 5px;
        }
        blockquote {
            border-left: 4px solid #a8b3ff;
            padding-left: 1em;
            margin-left: 0;
            margin-bottom: 1em;
            color: #555;
            background-color: rgba(168, 179, 255, 0.1);
            padding: 0.8em 1em;
            border-radius: 0 5px 5px 0;
            font-style: italic;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        code {
            font-family: 'Consolas', monospace;
            background-color: #f0f0f0;
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-size: 0.9em;
        }
        pre {
            background-color: #f0f0f0;
            padding: 1em;
            border-radius: 5px;
            overflow-x: auto;
            margin-bottom: 1em;
        }
        pre code {
            background-color: transparent;
            padding: 0;
            border-radius: 0;
            font-size: 0.9em;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 1em;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f0f0f0;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
    </style>
</head>
<body>
    ${preview.innerHTML}
</body>
</html>
        `;

        const blob = new Blob([htmlContent], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${title.replace(/[^\w\s]/gi, "")}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showNotification("HTML文件已下载！");
    }

    // 显示通知函数
    function showNotification(message) {
        // 检查是否已存在通知元素
        let notification = document.querySelector(".notification");

        if (!notification) {
            notification = document.createElement("div");
            notification.className = "notification";
            document.body.appendChild(notification);

            // 添加通知样式
            const style = document.createElement("style");
            style.textContent = `
                .notification {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background-color: var(--primary-color);
                    color: white;
                    padding: 12px 20px;
                    border-radius: 5px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                    z-index: 1000;
                    opacity: 0;
                    transform: translateY(20px);
                    transition: opacity 0.3s, transform 0.3s;
                }
                .notification.show {
                    opacity: 1;
                    transform: translateY(0);
                }
            `;
            document.head.appendChild(style);
        }

        notification.textContent = message;
        notification.classList.add("show");

        // 3秒后隐藏通知
        setTimeout(function () {
            notification.classList.remove("show");
        }, 3000);
    }

    // 初始化主题
    function initTheme() {
        // 检查本地存储中的主题设置
        const savedTheme = localStorage.getItem("markdownTheme");
        if (savedTheme) {
            document.documentElement.setAttribute("data-theme", savedTheme);

            // 更新主题切换按钮图标
            const icon = themeToggle.querySelector("i");
            if (savedTheme === "dark") {
                icon.classList.remove("fa-moon");
                icon.classList.add("fa-sun");
            } else {
                icon.classList.remove("fa-sun");
                icon.classList.add("fa-moon");
            }
        }
    }

    // 切换主题函数
    function toggleTheme() {
        const icon = themeToggle.querySelector("i");
        const currentTheme =
            document.documentElement.getAttribute("data-theme");

        if (currentTheme === "dark" || !currentTheme) {
            // 切换到浅色主题
            document.documentElement.setAttribute("data-theme", "light");
            icon.classList.remove("fa-sun");
            icon.classList.add("fa-moon");
            localStorage.setItem("markdownTheme", "light");
        } else {
            // 切换到深色主题
            document.documentElement.setAttribute("data-theme", "dark");
            icon.classList.remove("fa-moon");
            icon.classList.add("fa-sun");
            localStorage.setItem("markdownTheme", "dark");
        }
    }
});
