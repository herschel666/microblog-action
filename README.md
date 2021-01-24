# Microbog-Action

> Render a static Microblog from Github Issues. :ticket:

## Features

- supports blogposts and static pages
- automatically creates a RSS feed
- comes with 10 themes (powered by class-less CSS libraries)
- custom CSS
- static frontpage
- deploy arbitrary files from `/static`-folder
- deployment-agnostic: renders the site into a `_site`-folder
- mark drafts with a `WIP`-label
- limit publishing to issues with a certain label
- only publish closed labels (when open issues as a quality indicator is relevant)
- each blogpost's Canonical URL points to the original issue

## Usage

**Full-blown configuration**

```yaml
name: Build and Deploy Microblog

on:
  issues:
    types: [opened, edited, reopened, closed, deleted, labeled, unlabeled]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Build Microblog
        uses: herschel666/microblog-action@v0.3
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          url: 'https://myblog.tld/optional-path'
          title: 'My Awesome Microblog'
          description: 'See what I have written.'
          theme: 'water.css'
          date-format: 'yyyy-M-d'
          posts-per-page: 20
          pages: 'docs/**/*.md'
          static-frontpage: 'welcome.md'
          custom-styles: 'css/custom.css'
          label: 'blog'
          closed: true
          out-dir: '.tmp/site'
          static-dir: 'misc/files'
          lang: 'de'
          i18n.next: 'Nächste Artikel'
          i18n.prev: 'Vorherige Artikel'
          i18n.posts: 'Artikel'

      - Deploy Microblog
        uses: ... # Use your preferred service to deploy the contents of /_site
```

**Minimal configuration**

```yaml
name: Build and Deploy Microblog

on:
  issues:
    types: [opened, edited, reopened, closed, deleted, labeled, unlabeled]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Build Microblog
        uses: herschel666/microblog-action@v0.3
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          url: 'https://myblog.tld/optional-path'
```

## Configuration

| Option           | Required | Type                   | Default               | Description                                                                                                                            |
| ---------------- | -------- | ---------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| repo-token       | `true`   | `string`               | ·                     | Set to `${{ secrets.GITHUB_TOKEN }}` to enable the Action to fetch the issues via the Github API.                                      |
| url              | `true`   | `string`               | ·                     | Full URL of the Microblog. If it's located in a sub-folder, add that path here, too (e.g. `mysite.tld/microblog`).                     |
| title            | `false`  | `string`               | `<owner>'s Microblog` | The title of your Microblog.                                                                                                           |
| description      | `false`  | `string`               | `''`                  | Optional description, that's displayed below the title in the Microblog's header.                                                      |
| theme            | `false`  | `string`               | `'new.css'`           | Choose from ten available themes ([list of themes](#themes)).                                                                          |
| date-format      | `false`  | `string`               | `'d.M.yyyy H:mm'`     | Format of displayed dates. Powered by [`date-fns`'s `format`-function](https://date-fns.org/v2.16.1/docs/format).                      |
| posts-per-page   | `false`  | `number`               | `10`                  | Amount of blogposts displayed per page.                                                                                                |
| pages            | `false`  | `string` \| `string[]` | `'pages/*.md'`        | A glob or a list of globs pointing to markdown files, which will be rendered as static pages.                                          |
| static-frontpage | `false`  | `string`               | `''`                  | To show static content rather than blogposts on the frontpage, set the filename of the Markdown file, that's supposed to be displayed. |
| custom-styles    | `false`  | `string`               | `''`                  | Path to a CSS file relative to the repo root. If set, the contents of the file will be inlined in the Microblog's HTML head.           |
| label            | `false`  | `string`               | `''`                  | Set the name of a label, that marks issues that are supposed to be published as blogposts.                                             |
| closed           | `false`  | `boolean`              | `false`               | Set this to `true` if you want to maintain your blogposts as closed issues.                                                            |
| out-dir          | `false`  | `string`               | `'_site'`             | Path of the output folder for the rendered site relative to the repo root                                                              |
| static-dir       | `false`  | `string`               | `'static'`            | Path of [the static folder](#static-files) relative to the repo root                                                                   |
| lang             | `false`  | `string`               | `'en'`                | The Microblog's language as ISO 639-1 language code.                                                                                   |
| i18n.next        | `false`  | `string`               | `'next'`              | Label of the next-link                                                                                                                 |
| i18n.prev        | `false`  | `string`               | `'previous'`          | Label of the prev-link                                                                                                                 |
| i18n.posts       | `false`  | `string`               | `'Posts'`             | Label of the posts-link                                                                                                                |

## Blogposts

By default every issue in a repo is published as a blogpost. **Microblog-Action** supports
Github-flavored Markdown with [Remark](https://remark.js.org/).

To mark an issue as a draft, add a label named `WIP` or `wip` to it. Furthermore you can limit the
set of published issues by setting the `label`-option and thereby only publish issues as blogposts,
that have a certain label.

If the amount of open issues as a quality indicator is relevant to you, combine the `label`-option
with the `closed`-option and power your Microblog by closed issues that have a certain label.

## Static pages

**Microblog-Action** will publish every Markdown file, that matches the glob `<repo>/pages/*.md` as static
page by default.

To change the source or to add more sources, adjust the `pages`-option of the action. If you e.g. want to render the repo's `README.md` and
the contents of a `docs/`-folder, set the `pages`-option like this:

```yaml
- name: Build Microblog
  uses: herschel666/microblog-action@v0.3
  with:
    repo-token: ${{ secrets.GITHUB_TOKEN }}
    url: 'https://myblog.tld/optional-path'
    pages:
      - 'docs/**/*.md'
      - 'README.md'
```

Beware that **Microblog-Action** will flatten the folder-structure, so every page will end up at the
top-level of the site. This means, that two pages — `docs/examples.md` and `docs/api/examples.md` — will
conflict. Only the first one will be rendered.

### Frontmatter

**Microblog-Action** supports frontmatter for static pages. Although currently only the
`title`-property is processed. It is recommended to set the title, otherwise the file's basename is
used as label in the main navigation.

Set the title at the beginning of a file like this.

```yaml
---
title: Title of the page
---

```

### Static frontpage

It's also possible to make one of the static pages the frontpage of the Microblog — in contrast to
the list of blogposts, that's displayed by default. Given you have a file at `<repo>/pages/welcome.md` that
you want to display on the frontpage, set the `static-frontpage`-option to `welcome.md`. The lists
of blogposts will then be available at `/<posts>.html` — the actual slug of the posts's page depends
on the value of the `i18n.posts`-option.

## Themes

**Microblog-Action** aims to be minimal — in general as well as when it comes to styling. That's why
the basic approach is to go with a class-less CSS approach. This might change in the future, though.

But for now, the available themes are basically so-called class-less CSS libraries.

- [`water.css`](https://kognise.github.io/water.css/)
- [`mvp.css`](https://andybrewer.github.io/mvp/)
- [`awsm.css`](https://igoradamenko.github.io/awsm.css/elements.html)
- [`bahunya`](https://kimeiga.github.io/bahunya/)
- [`sakura.css`](https://oxal.org/projects/sakura/demo/)
- [`style.css`](https://css-pkg.github.io/style.css/)
- [`tufte-css`](https://github.com/edwardtufte/tufte-css)
- [`tacit`](https://yegor256.github.io/tacit/)
- [`new.css`](https://newcss.net/)
- [`bullframe.css`](https://github.com/marcop135/bullframe.css)

So if you want to use the `sakura.css`-theme, set the `theme`-option to `'sakura.css'`.

## Custom CSS

In case the class-less CSS lib doesn't quite do the trick there's the possiblity to add custom CSS.
Create a `.css`-file and assign its file path to the `custom-styles`-option. **Microblog-Action**
will fetch the contents of that file and inline it in the HTML head of each page.

## Static files

**Microblog-Action** will copy all contents of the `<repo>/static`-folder (if it exists) into the root of
the destination folder. It will flatten the directory structure when doing this. So a file like
`/static/deeply/nested/info.txt` will end up as `_site/info.txt`.

Static files are a great way to e.g. to provide `robots.txt` and/or `humans.txt` files. Or, if
you're using Netlify for hosting, you can keep a
[`netlify.toml`-file](https://docs.netlify.com/configure-builds/file-based-configuration/) in the
`/static`-folder.

## Deployment

**Microblog-Action** does not care how you deploy your Microblog. It just provides the site in a
`_site`-folder for you to do whatever you want with it.

### Example "Github Pages"

Here's a configuration for deploying your Microblog to Github Pages:

```yaml
name: Build and Deploy Microblog

on:
  issues:
    types: [opened, edited, reopened, closed, deleted, labeled, unlabeled]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Build Microblog
        uses: herschel666/microblog-action@KillYourMaster
        with: ...

      - name: Deploy Microblog
        uses: JamesIves/github-pages-deploy-action@3.7.1
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          BRANCH: gh-pages
          FOLDER: _site
          CLEAN: true
```

### Example "Netlify"

Here's a configuration for deploying your Microblog to Netlify:

```yaml
name: Build and Deploy Microblog

on:
  issues:
    types: [opened, edited, reopened, closed, deleted, labeled, unlabeled]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Build Microblog
        uses: herschel666/microblog-action@KillYourMaster
        with: ...

      - name: Deploy Microblog
        uses: nwtgck/actions-netlify@v1.1
        with:
          publish-dir: './_site'
          github-token: ${{ secrets.GITHUB_TOKEN }}
          production-deploy: true
          enable-pull-request-comment: false
          enable-commit-comment: false
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_ACCESS_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### Other deployment types

Whatever Github Action is able to push the contents of the `_site`-folder onto a server will be a
valid deployment action.

## Questions

I you have questions, feel free to ping me on twitter:
[@Herschel_R](https://twitter.com/Herschel_R).

---

The MIT License (MIT)

Copyright (c) 2021 Emanuel Kluge

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
