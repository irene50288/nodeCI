const puppeteer = require('puppeteer');
const userFactory = require("../factories/userFactory");
const sessionFactory = require("../factories/sessionFactory");

class Page {
  static async build() {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    const customPage = new Page(page);

    return new Proxy(customPage, {
      get: function(target, property) {
        return customPage[property] || browser[property] || page[property];
      }
    })
  }

  constructor(page) {
    this.page = page;
  }

  async login() {
    const user = await userFactory();
    const { session, sig } = sessionFactory(user);

    await this.page.setCookie({ name: 'session', value: session });
    await this.page.setCookie({ name: 'session.sig', value: sig });
    await this.page.goto('http://localhost:3000/blogs');
    await this.page.waitFor('a[href="/auth/logout"]');
  }

  async getContentsOf(selector) {
    return this.page.$eval(selector, el => el.innerHTML);
  }

  get(path) {
    return this.page.evaluate((_path) => (
      fetch(_path, {
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(res => res.json())
    ), path);
  }

  post(path, body) {
    return this.page.evaluate((_path, _body) => (
      fetch(_path, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(_body)
      }).then(res => res.json())
    ), path, body);
  }

  execRequest(actions) {
    return Promise.all(
      actions.map(({method, path, data}) => {
        return this[method](path, data);
      })
    );
  }
}

module.exports = Page;