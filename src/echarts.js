export default function install({use, utils, registerNodeType, BaseSprite}) {
  class EChart extends BaseSprite {
    createContext(w, h) {
      const container = document.createElement('canvas');
      const layer = this.layer;

      const pixelRatioX = layer.resolution[0] / layer.viewport[0];
      const pixelRatioY = layer.resolution[1] / layer.viewport[1];
      container.width = w / pixelRatioX;
      container.height = h / pixelRatioY;

      this.pixelRatio = [pixelRatioX, pixelRatioY];

      const chart = echarts.init(container);

      chart.setOption(this.option);
      chart.on('rendered', () => {
        this.forceUpdate(true);
      });

      const events = [
        'click', 'dblclick', 'mouseout',
        'mouseup', 'mousedown', 'mousemove',
        'touchstart', 'touchend', 'touchmove',
      ];

      const handler = (e) => {
        const originalEvent = e.originalEvent;
        const anchor = this.attr('anchor');
        const cz = this.clientSize;
        const offsetX = (e.offsetX + anchor[0] * cz[0]) / pixelRatioX;
        const offsetY = (e.offsetY + anchor[1] * cz[1]) / pixelRatioY;
        let type = originalEvent.type;
        if(type === 'mouseleave') type = 'mouseout';
        const newEvent = new MouseEvent(originalEvent.type, {
          screenX: offsetX,
          screenY: offsetY,
          clientX: offsetX,
          clientY: offsetY,
          bubbles: originalEvent.bubbles,
          button: originalEvent.button,
          buttons: originalEvent.buttons,
          cancelBubble: originalEvent.cancelBubble,
          cancelable: originalEvent.cancelable,
          currentTarget: originalEvent.currentTarget,
          fromElement: originalEvent.fromElement,
          relatedTarget: originalEvent.relatedTarget,
          returnValue: originalEvent.returnValue,
          srcElement: originalEvent.srcElement,
          target: originalEvent.target,
          toElement: originalEvent.toElement,
          view: originalEvent.view,
          which: originalEvent.witch,
        });

        this.chart.getDom().dispatchEvent(newEvent);
      };

      events.forEach((type) => {
        this.on(type, handler);
      });

      this.chart = chart;
    }

    setOption(option) {
      this.option = option;
    }

    render(t, drawingContext) {
      super.render(t, drawingContext);

      const [w, h] = this.clientSize;

      if(!this.chart) this.createContext(w, h);

      const canvas = this.chart.getRenderedCanvas({pixelRatio: 2});

      if(w !== canvas.width || h !== canvas.height) {
        const width = w / this.pixelRatio[0];
        const height = h / this.pixelRatio[1];
        this.chart.resize({width, height});
      }
      drawingContext.drawImage(canvas, 0, 0, w, h);
    }
  }

  registerNodeType('echart', EChart);

  return {EChart};
}