import chalk from 'chalk'
import { Client, ClientEvents, Collection, Message } from 'discord.js'
import { connect } from 'mongoose'
import config from '../config'
import RegisterFileCommands from './commands'
import RegisterFileEvents from './events'

class Command {
  constructor(
    public name: string,
    public description: string,
    public aliases: string[],
    public run: (
      client: Bot,
      message: Message,
      args: string[]
    ) => Promise<void | any> | void | any
  ) {
    Bot.commands.set(name, {
      ...this,
      isAlias: false
    })
    aliases.forEach(alias => {
      if (Bot.commands.has(alias)) {
        throw new Error(`Alias \`${alias}\` already exists`)
      } else {
        Bot.commands.set(alias, {
          ...this,
          isAlias: true
        })
      }
    })
    console.log(
      chalk.bold('[', chalk.green('new-command'), ']  '),
      name,
      chalk.grey(` call: ${name} ${aliases.join(' ')}`)
    )
  }
}

type EventHandler<K extends keyof ClientEvents> = (
  // eslint-disable-next-line no-use-before-define
  bot: Bot,
  ...args: ClientEvents[K]
) => void

class Event<K extends keyof ClientEvents> {
  constructor(public name: K, public handler: EventHandler<K>) {
    Bot.events.set(name, {
      name,
      handler: handler
    })
    console.log(chalk.bold('[', chalk.green('new-event'), ']  '), name)
  }
}

interface SavedCommand extends Command {
  isAlias: boolean
}

class Database {
  constructor(public databaseURL: string) {
    connect(databaseURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }).catch(console.error)
  }
}

class Bot {
  public readonly client: Client
  public readonly database: Database
  public readonly config = config
  public readonly token: string
  static commands: Collection<string, SavedCommand> = new Collection<
    string,
    SavedCommand
  >()

  static events: Collection<string, Event<any>> = new Collection<
    string,
    Event<keyof ClientEvents>
  >()

  constructor(token: string) {
    if (!token || token === '') throw new Error('Token is invalid')
    this.token = token
    this.client = new Client()
    this.database = new Database('mongodb://localhost:27017/discord-bot')
    this.client.on('ready', () =>
      console.log(
        chalk.bold('[', chalk.green('bot'), ']  '),
        'logged in as ',
        chalk.bold(this.client.user?.tag)
      )
    )
  }

  public get commands(): Collection<string, SavedCommand> {
    return Bot.commands
  }

  public get events(): Collection<string, Event<any>> {
    return Bot.events
  }

  private registerEvents() {
    this.events.map(event => {
      try {
        this.client.addListener(event.name, (...args) =>
          event.handler(this, ...args)
        )
        return true
      } catch (e) {
        return false
      }
    })
  }

  public async start(): Promise<void> {
    await RegisterFileEvents()
    this.registerEvents()
    await RegisterFileCommands()
    this.client.login(this.token)
  }
}

export default Bot

export { Bot, Command, Event, Database }