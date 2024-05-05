const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const app = express();
app.use(bodyParser.json());

let users = [];
let nextUserId = 1;

let messages = [];
let nextMessageId = 1;

app.get('/', (req, res) => {
    if (res.statusCode === 200) {
        res.send("Bem vindo à aplicação");
    }
});

app.post('/signup', async (req, res) => { 
    const { name, email, password } = req.body;

    if (!name) {
        res.status(400).send("Por favor, verifique se passou o nome.");
        return;
    } else if (!email) {
        res.status(400).send("Por favor, verifique se passou o email.");
        return;
    } else if (!password) {
        res.status(400).send("Por favor, verifique se passou a senha.");
        return;
    } else {
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            return res.status(400).send('Email já cadastrado, insira outro');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const id = nextUserId++;
        const newUser = { id, name, email, password: hashedPassword };
        users.push(newUser);
        res.status(201).send(`Seja bem vindo, ${name}! Pessoa usuária registrada com sucesso!`);
    }
});

app.post('/login', async (req, res) => { 
    const { email, password } = req.body;

    if (!email) {
        res.status(400).send("Por favor, verifique se passou o email.");
    } else if (!password) {
        res.status(400).send("Por favor, verifique se passou a senha.");
    } else {
        if (users.length === 0) {
            res.status(400).send("Email não encontrado no sistema, verifique ou crie uma conta");
        } else {
            const user = users.find(user => user.email === email);
            if (user) {
                if (await bcrypt.compare(password, user.password)) {
                    res.status(200).send(`Seja bem vindo, ${user.name}! Pessoa usuária logada com sucesso!`);
                    return;
                } else {
                    res.status(400).send("Senha incorreta.");
                    return;
                }
            } else {
                res.status(400).send("Email não encontrado no sistema, verifique ou crie uma conta");
            }
        }
    }
});

app.post('/message', async (req, res) => {
    const { email, title, description } = req.body;
    const user = users.find(user => user.email === email);

    if (!user) {
        res.status(404).send("Email não encontrado, verifique ou crie uma conta");
        return;
    } else if (!title) {
        res.status(400).send("Por favor, verifique se passou o título.");
        return;
    } else if (!description) {
        res.status(400).send("Por favor, verifique se passou a descrição.");
        return;
    } else {
        const id = nextMessageId++;
        const newMessage = { id, title, description };
        messages.push(newMessage);
        res.status(201).send(`Mensagem enviada com sucesso! ${title} - ${description}`);
    }
});

app.get('/message/:email', async (req, res) => {
    const email = req.params.email;
    const user = users.find(user => user.email === email);
    if (!user) {
        res.status(404).send("Email não encontrado, verifique ou crie uma conta");
        return;
    } else {
        res.status(200).send(`Seja bem-vinde! ${JSON.stringify(messages)}`);
    }
});

app.put('/message/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const { title, description } = req.body;
    const messageIndex = messages.findIndex(message => message.id === id);
    if (messageIndex === -1) {
        res.status(404).send("Por favor, informe um id válido da mensagem");
    } else {
        messages[messageIndex].title = title;
        messages[messageIndex].description = description;
        res.status(200).send(`Mensagem atualizada com sucesso! ${title} - ${description}`);
    }
});

app.delete('/message/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const messageIndex = messages.findIndex(message => message.id === id);
    if (messageIndex === -1) {
        res.status(404).send("Mensagem não encontrada, verifique o identificador em nosso banco");
    } else {
        messages.splice(messageIndex, 1);
        res.status(200).send("Mensagem apagada com sucesso!");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});