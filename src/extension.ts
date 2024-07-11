// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { displayMethod, emojiList } from './emoji';
import type { GitExtension, Repository } from './git';

function getGitExtension() {
    const vscodeGit = vscode.extensions.getExtension<GitExtension>('vscode.git');
    const gitExtension = vscodeGit && vscodeGit.exports;
    // [vscode/extensions/git/README.md at main · microsoft/vscode](https://github.com/microsoft/vscode/blob/main/extensions/git/README.md) - 这里有 getAPI 的说明
    return gitExtension && gitExtension.getAPI(1);
}

// 增加前缀
function prefixCommit(repository: Repository, prefix: string) {
    repository.inputBox.value = `${prefix}${repository.inputBox.value}`;
}
const CommitDetailQuickPickOptions: vscode.QuickPickOptions = {
    matchOnDescription: true,
    matchOnDetail: true,
    ignoreFocusOut: true,
    placeHolder: 'search emoji type'
};

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "git-emoji-atomgit" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	// const disposable = vscode.commands.registerCommand('git-emoji-atomgit.gitEmoji', () => {
	// 	// The code you place here will be executed every time your command is executed
	// 	// Display a message box to the user
	// 	vscode.window.showInformationMessage('git-emoji-atomgit.gitEmoji');

	// });

  const disposable = vscode.commands.registerCommand('git-emoji-atomgit.gitEmoji', (uri?) => {
        // 需要安装了 git 插件
        const git = getGitExtension();
        if (!git) {
            vscode.window.showErrorMessage('unable to load Git Extension');
            return;
        }

        // init pick items use emoji 展现方式
        // let items = emojis.map(use_emoji)
        // 获取 emoji 展示方式（实际是个函数）
        const method_key = context.globalState.get('displayMethod', 'default');
        // 获取转换后的 all emojis
        let items = emojiList.map(displayMethod[method_key]);

        // 显示选项列表，提示用户选择
        vscode.window.showQuickPick(items,CommitDetailQuickPickOptions).then(function (selected) {
            if (selected) {
                console.log(uri);
                // 这条命令，是打开 git 插件的 scm 视图(source control)
                vscode.commands.executeCommand('workbench.view.scm');
                if (uri) {
                    //如果有多个 repo 寻找当前的 repo 进行填充
                    let selectedRepository = git.repositories.find((repository) => {
                        const uriRoot = uri._rootUri ? uri._rootUri : uri.rootUri;
                        return repository.rootUri.path === uriRoot?.path;
                    });
                    if (selectedRepository) {
                        prefixCommit(selectedRepository, selected.emoji);
                    }
                } else {
                    // 这里是处理了多个 git 仓库的情况吗
                    // 哦，知道了，这是直接 ctrl+p，输入gitEmoji 命令时，如果有多个 git 仓库打开了，就全部执行添加前缀；
                    for (let repo of git.repositories) {
                        prefixCommit(repo, selected.emoji);
                    }
                }
            }
        });
    });

  vscode.commands.registerCommand('git-emoji-atomgit.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from git-emoji-atomgit!');
	});

  // vscode.commands.registerCommand('git-emoji-atomgit.formatSwitch', (uri?) => {
  //       vscode.window.showInformationMessage('git-emoji-atomgit.formatSwitch');
  //   });

  vscode.commands.registerCommand('git-emoji-atomgit.formatSwitch', (uri?) => {
        const items = [];
        for (const key in displayMethod) {
            items.push(key);
        }
        vscode.window.showQuickPick(items).then((res) => {
            context.globalState.update('displayMethod', res);
        });
    });

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
