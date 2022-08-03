import { isFakeTouchstartFromScreenReader } from '@angular/cdk/a11y';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { fabric } from "fabric";


@Component({
  selector: 'app-draw',
  templateUrl: './draw.component.html',
  styleUrls: ['./draw.component.scss']
})

export class DrawComponent implements OnInit, AfterViewInit {

  constructor() { }

  canvas: any;
  points: any[] = [];
  centerPoint: any;
  menuOpts: any = { display: 'none', top: 0, left: 0 };

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.canvas = new fabric.Canvas('canvas', {
      stopContextMenu: true,
      fireRightClick: true
    });

    var onCanvasMouseDown = function (evt: any, that: any) {
      evt.e.preventDefault();
      let point = evt.pointer;
      if (that.menuOpts.display !== "none") {
        that.menuOpts.display = "none";
        return;
      }

      if(!evt.target && evt.button ===3) return;
      if (evt.target && evt.button === 3) {
        let isPolygonPointed = that.isPolygonPointed(evt, point);
        if (isPolygonPointed) {
          that.menuOpts = { display: 'block', top: point.y, left: point.x };
        }
        return;
      }

      if (evt.target && evt.button === 1) {
        let isPolygonPointed = that.isPolygonPointed(evt, point);
        if (isPolygonPointed) return;
      }

      if (that.points.length === 0) {
        that.points = [point];
      } else {
        that.points.push(point);
      }
      that.draw();
    }

    this.canvas.on("mouse:down", (e: any) => onCanvasMouseDown(e, this));
  }

  onPolygonMoved(e: any): void {
    let newCenterPoint = e.target.getCenterPoint();
    let diffPoint = { x: newCenterPoint.x - this.centerPoint.x, y: newCenterPoint.y - this.centerPoint.y };
    let newPoints = this.points.map(p => { return { x: p.x + diffPoint.x, y: p.y + diffPoint.y } });
    this.points = newPoints;

  }

  draw(): void {
    this.canvas.clear();
    let group = new fabric.Group([], { selectable: true });

    for (let i = 0; i < this.points.length; i++) {
      let p = this.generatePoint(this.points[i].x, this.points[i].y);
      p.selectable = true;
      p.hasControls = false;
      group.addWithUpdate(p);
    }

    if (this.points.length === 1) {
      this.canvas.add(group);
      return;
    };

    if (this.points.length === 2) {
      let line = new fabric.Line([this.points[0].x + 2.5, this.points[0].y + 2.5, this.points[1].x + 2.5, this.points[1].y + 2.5],
        { stroke: 'red', selectable: false, opacity: 0.5 });
      group.addWithUpdate(line);
      this.canvas.add(group);
      return;
    }

    let polyline = new fabric.Polygon(this.points.map(p => { return { x: p.x + 2.5, y: p.y + 2.5 } }), {
      fill: 'red',
      stroke: 'red',
      opacity: 0.3,
      hasControls: true,
      selectable: true,
      hoverCursor: 'pointer'
    });

    group.addWithUpdate(polyline);
    group.hasControls= false;
    group.hasBorders= false;
    this.centerPoint = group.getCenterPoint();
    group.on("modified", (e: any) => {
      this.onPolygonMoved(e);
    });
    this.canvas.add(group);
  }

  generatePoint(x: number = 0, y: number = 0): fabric.Rect {
    return new fabric.Rect({
      top: y,
      left: x,
      width: 6,
      height: 6,
      fill: 'red',
      borderColor: 'red',
      hasBorders: true,
      selectable: true,
      hasControls: false
    });
  }

  onReset(): void {
    this.canvas.clear();
    this.points = [];
    this.menuOpts.display = "none";
  }

  isPolygonPointed(evt: any, p: any): boolean {
    let pointInside = [];
    evt.target.forEachObject((obj: any, i: any) => {
      if (this.canvas.isTargetTransparent(obj, p.x, p.y)) {
        pointInside.push(obj);
      }
    });
    if (pointInside.length === this.points.length) {
      return true;
    }
    return false;

  }

  onViewInfo(): void {
    this.onCloseMenu();
    alert("This is perform action for View Info");
  }

  onEditInfo(): void {
    this.onCloseMenu();
    console.log(this.menuOpts.display);
    alert("This is perform action for Edit Info");
  }

  onCloseMenu(): void {
    this.menuOpts.display = "none";
  }

  contextMenu(): boolean {
    return false;
  }


}

