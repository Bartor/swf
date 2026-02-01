// @vitest-environment happy-dom
import { span } from '../blocks';
import { makeRenderable } from './rendering-utils';

describe('makeRenderable', () => {
  it('should map number to a textblock', () => {
    const [result] = makeRenderable([10]);
    const renderedResult = result();
    expect(result).to.be.instanceOf(Function);
    expect(renderedResult).to.be.instanceOf(Text);
  });

  it('should map string to a textblock', () => {
    const [result] = makeRenderable(['test']);
    const renderedResult = result();
    expect(result).to.be.instanceOf(Function);
    expect(renderedResult).to.be.instanceOf(Text);
  });

  it('should not map a block', () => {
    const block = span({});
    const [result] = makeRenderable([block]);
    expect(result).to.be.equal(block);
  });
});
