const inquirer = require("inquirer")
const chalk    = require("chalk")

const fs       = require("fs")

operation()

function operation(){
    inquirer
        .prompt([
            {
            type:"list",
            name:"action",
            message:"O que você deseja fazer?",
            choices:[
                "CRIAR CONTA",
                "CONSULTAR SALDO",
                "DEPOSITAR",
                "SACAR",
                "SAIR",
        ],
    },
])
    .then((answer) => {
        const action = answer["action"]
        if(action === "CRIAR CONTA"){
            createAccount()
        }
        else if (action === "CONSULTAR SALDO"){
            getAccountBalance()
        }
        else if (action === "DEPOSITAR"){
            deposit()
        }
        else if (action === "SACAR"){
            withdraw()
        }
        else if (action === "SAIR"){
            console.log(chalk.bgBlue.black("Obrigado por usar o accounts!"))
            process.exit()
        }
    })
    .catch((err)=> console.log(err)) //then seria uma das soluçoes de escolha eo catch um erro que pode acontecer
}

function createAccount(){
    console.log(chalk.bgGreen.black("Parabéns por escolher o nosso banco"))
    console.log(chalk.green("Defina as opções da sua conta a seguir"))
    
    buildAccount()
}


function buildAccount(){
    inquirer
        .prompt([
            {
             name:"accountName",
             message:"Digite um nome para sua conta: ",
            },
    ])
    .then((answer) => {
        const accountName = answer["accountName"]
        console.info(accountName)

        if(!fs.existsSync("accounts")){
            fs.mkdirSync("accounts")
        }
        if(fs.existsSync(`accounts/${accountName}.json`)){
            console.log(chalk.bgRed.black("Esta conta ja existe, escolha outra!"))
        
            buildAccount()
            return
        }
        fs.writeFileSync(`accounts/${accountName}.json`, `{"balance": 0}`, 
            function (err){
                console.log(err)
            },
        )
        console.log(chalk.green("Parabéns, a sua conta foi criada"))
        operation()
    })
    .catch((err) => console.log(err))
}

function deposit(){
    inquirer.prompt([
        {
            name:"accountName",
            message:"Qual o nome da sua conta?"
        },
    ])
    .then((answer) =>{
        const accountName = answer["accountName"]
        if(!checkAccount(accountName)){
            return deposit()
        }

        inquirer.prompt([
            {
                name:"amount",
                message:"Quanto você deseja depositar?",
            },
        ]).then((answer) => {
            const amount = answer["amount"]
            
            addAmount(accountName, amount)
            operation()

        }).catch(err => console.log(err))

    })
    .catch(err => console.log(err))
}

function checkAccount(accountName){
    if(!fs.existsSync(`accounts/${accountName}.json`)){
        console.log(chalk.bgRed.black("Esta conta não existe, tente novamente!"))
        return false
    }
    return true
}

function addAmount(accountName, amount){
    const accountData = getAccount(accountName)

    if(!amount){
        console.log(chalk.bgRed.black("Ocorreu um erro, tente novamente mais tarde"))
        return deposit()
    }

    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function (err){
            console.log(err)
        }
    )
    console.log(chalk.green(`Foi depositado o valor R$${amount} na sua conta!`),
    )
}

function getAccount(accountName){
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: "utf8",
        flag: "r",
    })
    return JSON.parse(accountJSON)
}

function getAccountBalance(){
    inquirer.prompt([
        {
            name: "accountName",
            message: "Qual o nome da sua conta?",
        }
    ]).then((answer) => {
        const accountName = answer["accountName"]
        
        if(!checkAccount(accountName)){
            return getAccountBalance()
        }

        const accountData = getAccount(accountName)
        console.log(chalk.bgBlue.black(`Olá o saldo da sua conta é de R$${accountData.balance}`

        ),
    )
        operation()

    }).catch(err => console.log(err))
}

function withdraw(){
    inquirer.prompt([
        {
            name: "accountName",
            message: "Qual é o nome da sua conta?"
        }
    ]).then((answer) => {
        const accountName = answer["accountName"]

        if(!checkAccount(accountName)){
            return withdraw()
        }

        inquirer.prompt([
            {
                name: "amount",
                message: "Quanto você deseja sacar?"
            }
        ]).then((answer) =>{
            const amount = answer["amount"]
            
            removeAmount(accountName,amount)

        }).catch(err => console.log(err))

    }).catch(err => console.log(err))
}

function removeAmount(accountName, amount){
    const accountData = getAccount(accountName)

    if(!amount){
        console.log(chalk.bgRed.black("Ocorreu um erro, tente novamente mais tarde!"),
     )
     return withdraw()
    }

    if(accountData.balance < amount){
        console.log(chalk.bgRed.black("Valor indisponível"))
        return withdraw()
    }

    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function(err){
            console.log(err)
        },
    )
    console.log(chalk.green(`Foi realizado um saque de R$${amount} da sua conta!`),
    )
    operation()
}