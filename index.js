const inquirer = require("inquirer")
const fs = require("fs")
const chalk = require("chalk")
const { isNumber } = require("util")
const { type } = require("os")

operation()

function operation() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "O que deseja fazer?",
        choices: [
          "Criar conta",
          "Consultar saldo",
          "Depositar",
          "Sacar",
          "Sair",
        ],
      },
    ])
    .then((answers) => {
      const choice = answers.action
      if (choice == "Criar conta") {
        createAccount()
      } else if (choice == "Consultar saldo") {
        balanceQuery()
      } else if (choice == "Depositar") {
        deposit()
      } else if (choice == "Sacar") {
        withdraw()
      } else {
        console.log("Saindo do sistema...")
        process.exit()
      }
    })
    .catch((err) => console.log(err))
}

function createAccount() {
  console.log(chalk.bgGreen.black("Parabéns por escolher nossos serviços!"))
  console.log(chalk.green("Defina as opções da sua conta a seguir"))
  buildAccount()
}

function buildAccount() {
  inquirer
    .prompt([{ name: "accountName", message: "Digite o nome da conta:" }])
    .then((answer) => {
      const accountName = answer.accountName

      if (!fs.existsSync("accounts")) {
        fs.mkdirSync("accounts")
      }

      if (fs.existsSync(`accounts/${accountName}.json`)) {
        console.log("Essa conta já existe, escolha outro nome")
        buildAccount()
        return
      }
      fs.writeFileSync(
        `accounts/${accountName}.json`,
        `{"balance":0}`,
        (err) => {
          if (err) {
            console.log(err)
            return
          }
        }
      )
      console.log(
        chalk.green(`Parabéns! sua conta foi criada com o nome ${accountName}`)
      )
      operation()
    })
    .catch((err) => console.log(err))
}

function balanceQuery() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Digite o nome da conta:",
      },
    ])
    .then((answer) => {
      accountName = answer.accountName
      if (!checkAccount(accountName)) {
        balanceQuery()
        return
      }
      const conta = getAccount(accountName)
      console.log(`O saldo da sua conta é de R$${conta.balance}`)
      operation()
    })
    .catch((err) => console.log(err))
}

function deposit() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Digite o nome da sua conta:",
      },
    ])
    .then((answer) => {
      const accountName = answer.accountName
      if (!checkAccount(accountName)) {
        deposit()
        return
      }
      inquirer
        .prompt([
          {
            name: "amount",
            message: "Quanto você quer depositar?",
          },
        ])
        .then((answer) => {
          addAmount(accountName, answer.amount)
        })
        .catch((err) => console.log(err))
    })
    .catch((err) => console.log(err))
}

function withdraw() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Digite o nome da sua conta:",
      },
    ])
    .then((answer) => {
      const accountName = answer.accountName
      if (!checkAccount(accountName)) {
        withdraw()
        return
      }
      inquirer
        .prompt([
          {
            name: "amount",
            message: "Quanto você quer sacar?",
          },
        ])
        .then((answer) => {
          takeAmount(accountName, answer.amount)
        })
        .catch((err) => console.log(err))
    })
    .catch((err) => console.log(err))
}

function getAccount(accountName) {
  const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
    encoding: "utf-8",
    flag: "r",
  })
  return JSON.parse(accountJSON)
}

function checkAccount(accountName) {
  if (!fs.existsSync(`accounts/${accountName}.json`)) {
    console.log("Essa conta não existe")
    return false
  }
  return true
}

function addAmount(accountName, amount) {
  const conta = getAccount(accountName)
  conta.balance = Number(conta.balance) + Number(amount)
  if (!amount || isNaN(amount)) {
    console.log("Ocorreu um erro, tente novamente mais tarde!")
    return deposit()
  }
  fs.writeFileSync(
    `accounts/${accountName}.json`,
    `{"balance":${conta.balance}}`,
    function (err) {
      console.log(err)
    }
  )
  console.log(`Foi adicionado R$${amount} a sua conta`)
  operation()
}

function takeAmount(accountName, amount) {
  const conta = getAccount(accountName)
  amount = Number(amount)
  if (!amount || isNaN(amount)) {
    console.log("Ocorreu um erro, tente novamente mais tarde!")
    return withdraw()
  } else if (Number(conta.balance) < amount) {
    console.log("Esta conta não tem saldo suficiente")
    return withdraw()
  }

  conta.balance = Number(conta.balance) - amount

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    `{"balance":${conta.balance}}`,
    function (err) {
      console.log(err)
    }
  )
  console.log(`Foi sacado R$${amount} da conta`)
  operation()
}
