import { Component, OnInit } from '@angular/core';

interface Node {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Point {
  x: number;
  y: number;
}

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent implements OnInit {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D

  source: Node = {
    x: 200,
    y: 200,
    width: 200,
    height: 100
  };

  target: Node = {
    x: 1000,
    y: 500,
    width: 200,
    height: 100
  };

  ngOnInit() {
    this.canvas = document.getElementById("test") as any as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d");

    this.draw(this.ctx);
  }

  pointOnRect(x, y, minX, minY, maxX, maxY, validate): Point {
    //assert minX <= maxX;
    //assert minY <= maxY;
    if (validate && (minX < x && x < maxX) && (minY < y && y < maxY))
      return undefined;

    var midX = (minX + maxX) / 2;
    var midY = (minY + maxY) / 2;

    // if (midX - x == 0) -> m == ±Inf -> minYx/maxYx == x (because value / ±Inf = ±0)
    var m = (midY - y) / (midX - x);

    if (x <= midX) { // check "left" side
      var minXy = m * (minX - x) + y;
      if (minY <= minXy && minXy <= maxY)
        return {x: minX, y: minXy};
    }

    if (x >= midX) { // check "right" side
      var maxXy = m * (maxX - x) + y;
      if (minY <= maxXy && maxXy <= maxY)
        return {x: maxX, y: maxXy};
    }

    if (y <= midY) { // check "top" side
      var minYx = (minY - y) / m + x;
      if (minX <= minYx && minYx <= maxX)
        return {x: minYx, y: minY};
    }

    if (y >= midY) { // check "bottom" side
      var maxYx = (maxY - y) / m + x;
      if (minX <= maxYx && maxYx <= maxX)
        return {x: maxYx, y: maxY};
    }

    // edge case when finding midpoint intersection: m = 0/0 = NaN
    if (x === midX && y === midY) return {x: x, y: y};

    return undefined;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.restore();

    const position: Point = {
      x: (this.source.x + this.target.x) / 2,
      y: (this.source.y + this.target.y) / 2
    }

    const distance = Math.sqrt(Math.pow((this.target.x - this.source.x), 2) + Math.pow((this.target.y - this.source.y), 2));

    const angle = Math.atan2(this.target.y - this.source.y, this.target.x - this.source.x);
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#000000';
    ctx.lineWidth = 3;

    ctx.save();

    ctx.beginPath();
    ctx.moveTo(this.source.x, this.source.y);
    ctx.lineTo(this.target.x, this.target.y);
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = '#0000ff';
    ctx.fillRect(this.source.x - (this.source.width / 2), this.source.y - (this.source.height / 2), this.source.width, this.source.height);
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(this.target.x - (this.target.width / 2), this.target.y - (this.target.height / 2), this.target.width, this.target.height);
    ctx.closePath();

    ctx.restore();

    const text = 'Blocks';
    const textWidth = ctx.measureText(text).width;
    if (distance >= 300) {
      let rotation = angle + 2 * Math.PI;
      if (this.source.x > this.target.x) {
        rotation = angle + Math.PI;
      }

      ctx.save();
      ctx.textAlign = 'center';
      let pointOnSource = this.pointOnRect(this.target.x, this.target.y, this.source.x - (this.source.width / 2), this.source.y - (this.source.height / 2), this.source.x + (this.source.width / 2), this.source.y + (this.source.height / 2), true);

      let sourceDistFromCenter = Math.sqrt(Math.pow((pointOnSource.x - this.source.x), 2) + Math.pow((pointOnSource.y - this.source.y), 2));
      ctx.translate(this.source.x, this.source.y);
      ctx.rotate(rotation);
      ctx.fillText(text, (textWidth + sourceDistFromCenter) * (this.source.x > this.target.x ? -1 : 1), -3);
      ctx.restore();

      ctx.save();
      let pointOntarget = this.pointOnRect(this.source.x, this.source.y, this.target.x - (this.target.width / 2), this.target.y - (this.target.height / 2), this.target.x + (this.target.width / 2), this.target.y + (this.target.height / 2), true);

      let targetDistFromCenter = Math.sqrt(Math.pow((pointOntarget.x - this.target.x), 2) + Math.pow((pointOntarget.y - this.target.y), 2));
      ctx.translate(this.target.x, this.target.y);
      ctx.rotate(rotation);
      ctx.textAlign = 'center';
      ctx.fillText(text, (textWidth + targetDistFromCenter) * (this.source.x > this.target.x ? 1 : -1), -3);
      ctx.restore();
    } else {
      ctx.save();
      ctx.translate(position.x, position.y);
      if (this.source.x > this.target.x) {
        ctx.rotate(angle + Math.PI);
      } else {
        ctx.rotate(angle + 2 * Math.PI);
      }
      ctx.textAlign = 'center';
      ctx.fillText(text, 0, -3);
      ctx.restore();
    }
  }

  moveSource(event: MouseEvent) {
    this.source = { ...this.source,
      x: event.clientX,
      y: event.clientY
    }
    this.draw(this.ctx);
  }
}
