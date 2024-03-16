---@diagnostic disable: undefined-global

local host = "localhost"
local port = 10581

local socket
local tries = 0

function connect()
    tries += 1
    socket = websocket.connect(`ws://{host}:{port}`)

    if not socket and 5 >= tries then
        task.delay(5, connect)
    end
end

connect()

socket:Send(`Connected to {game.Players.LocalPlayer.Name}`)

socket.OnMessage:Connect(function(message)
    xpcall(function()
        loadstring(message)()
    end, function(err)
        socket:Send(`Error: {err}`)
    end)
end)