const { createTR, createTH, createTD, removeChildren } = require('../dom-util');
describe('dom-util', () => {
  
  describe('DOM creation functions', () => {
    describe('createTH', () => {
      it('produces valid TH element', () => {
        const el = createTH();
        expect(el.tagName).toBe('TH');
      });
      it('sets text of TH', () => {
        const text= "Well done!!!nice work..";
        const el = createTH(text);
        expect(el.textContent).toBe(text);
      });
    });
    describe('createTD', () => {
      it('produces valid TD element', () => {
        const el = createTD();
        expect(el.tagName).toBe('TD');
      });
    });
    describe('createTR', () => {
      it('produces valid TR element', () => {
        const el = createTR();
        expect(el.tagName).toBe('TR');
      });
    });
  });
  describe('removeChildren()', () => {
    it('removes one child', () => {
      const parent = document.createElement('DIV');
      const child = document.createElement('STRONG');
      parent.appendChild(child);
      expect(parent.childNodes.length).toBe(1);
      expect(parent.childNodes[0]).toBe(child);
      removeChildren(parent);
      expect(parent.childNodes.length).toBe(0);
    });
  });
});