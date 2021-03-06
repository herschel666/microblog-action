# Contributing

## File an issue

If you stumble upon a bug, please feel free [to open an
issue](https://github.com/herschel666/microblog-action/issues/new) & describe the erroneous
behaviour.

## Commit a change

If you feel like solving the issue yourself, fork the repo, clone it to your local machine and set it up like this…

### Use Node v14

I recommend using [`nvm`](https://github.com/nvm-sh/nvm#node-version-manager---). If you don't have
the correct version installed already, run the following command in your terminal:

```sh
nvm install 14
```

Otherwise start using it in the project's root directory by running the command…

```sh
nvm use 14
```

### Install dependencies

To install the dependencies run the following command in your terminal:

```sh
npm install
```

You can also use Yarn, but please don't commit the `yarn.lock`-file in that case!

### Create an `.env`-file

In order for you to be able to run the integration tests, you need [a Github Access
Token](https://github.com/settings/tokens/new) with scope `repo -> public_repo`, because the data
needed is fetched from a real repository.

Store the token like this in the `.env`-file in the project's root directory:

```
GH_ACCESS_TOKEN=<token…>
```

Now the data will be available.

### Make your changes

Set up a new branch, make your changes, run the command `npm run build` in the terminal and commit
the changes using the [Conventional Commit format](https://www.conventionalcommits.org/en/v1.0.0/)
without a scope. Running the `build`-command is essential here, because the consumers of the
Microblog-Action get the contents of the `./dist`-folder! After that, create a pull request against
the main repo.

You won't be able to run the integration tests locally, because they fetch their contents from a
real repository and therefor need a Github Access Token. The Github Action will tell you whether
everything is still running as expected.

### Release a new version

> :warning: This can only be done by authorized maintainers of the repo.

1. Run `npx standard-version` in the terminal
2. Push everything by running `git push origin HEAD --tags`
