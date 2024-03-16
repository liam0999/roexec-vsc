const vscode = require('vscode');
const ws = require("ws")

const extensionConfig = vscode.workspace.getConfiguration("roexec-vsc")

var socketConnection

console.log(`Extension Started on ${extensionConfig.port}`)

new ws.WebSocketServer({ port: extensionConfig.port })
.on("connection", async (connection) => {
	if (socketConnection) socketConnection.close()
	
	socketConnection = connection

	connection.on("close", () => socketConnection = undefined)
	connection.on("error", vscode.window.showErrorMessage)
	connection.on("message", (message) => {
		message = message.toString()
		if (message.startsWith("Error")) vscode.window.showErrorMessage(message)
		else vscode.window.showInformationMessage(message)
	})
})

function execute() {
	const textEditor = vscode.window.activeTextEditor
	
	if (!socketConnection) return vscode.window.showErrorMessage("Unable to execute: Not connected")
	if (!textEditor) return vscode.window.showErrorMessage("Unable to execute: Not in file")

	socketConnection.send(textEditor.document.getText())
	vscode.window.showInformationMessage("Executed")
}

function activate(context) {

	const executeCommand = vscode.commands.registerCommand("roexec-vsc.execute", execute)
	context.subscriptions.push(executeCommand);

	const executeButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right)
	executeButton.text = "Roblox Execute"
	executeButton.command = "roexec-vsc.execute"
	executeButton.show()

}

function deactivate() {
	if (socketConnection) socketConnection.close()
}

module.exports = {
	activate,
	deactivate
}
