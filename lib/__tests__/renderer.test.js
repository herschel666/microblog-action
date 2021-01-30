const nunjucks = require('nunjucks');

const { createRenderer } = require('../renderer');

describe('renderer', () => {
  let renderer;

  it('should create the renderer', () => {
    const folder = './some/folder';
    const spy = jest.spyOn(nunjucks, 'configure');
    renderer = createRenderer(folder);

    expect(spy).toHaveBeenCalledWith(folder);
  });

  describe('filter: debug', () => {
    it('should handle objects', () => {
      const data = {
        foo: {
          lorem: 'ipsum',
          dolor: [1, 'sit', null, 'amet'],
          bar: '<p>test</p>',
        },
      };
      expect(renderer.renderString('{{ foo | debug }}', data))
        .toMatchInlineSnapshot(`
        "<pre><code>{
          &quot;lorem&quot;: &quot;ipsum&quot;,
          &quot;dolor&quot;: [
            1,
            &quot;sit&quot;,
            null,
            &quot;amet&quot;
          ],
          &quot;bar&quot;: &quot;&lt;p&gt;test&lt;/p&gt;&quot;
        }</code></pre>"
      `);
    });

    it('should handle strings', () => {
      expect(
        renderer.renderString('{{ foo | debug }}', { foo: 'bar' })
      ).toMatchInlineSnapshot(`"<pre><code>bar</code></pre>"`);
    });
  });
});
