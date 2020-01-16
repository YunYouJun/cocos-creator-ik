import Joint from './Joint';

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Prefab)
    prefabRope: cc.Prefab = null;

    @property(cc.Node)
    nodeRope: cc.Node = null;

    @property()
    fixed: boolean = false;

    @property(cc.Integer)
    jointNum: number = 32;

    @property(cc.Float)
    length: number = 12;

    _arrayRope: cc.Node[] = [];
    _canvas: cc.Graphics = null;
    _touchLocation: cc.Vec2 = cc.Vec2.ZERO;

    _touch: boolean = true;

    // LIFE-CYCLE CALLBACKS:

    start() {
        let angle = 0;

        for (let index = 0; index < this.jointNum; index++) {
            let rope = cc.instantiate(this.prefabRope);

            rope.parent = this.nodeRope;
            this._arrayRope.push(rope);

            let script = rope.getComponent(Joint);
            if (index == 0) {
                script.init(0, 0, this.length, angle)
            } else {
                let last = this._arrayRope[index - 1].getComponent(Joint);
                script.init(last.getTargetPoint().x, last.getTargetPoint().y, this.length, angle - index);
            }
        }

        this.node.on("touchstart", this.onTouchMove, this);
        this.node.on("touchmove", this.onTouchMove, this);
        this.node.on("touchend", this.onTouchEnd, this);

        this._canvas = this.nodeRope.getComponent(cc.Graphics);

        this.update(0);
        this._touch = false;
    }

    onDestroy() {
        this.node.off("touchstart", this.onTouchMove, this);
        this.node.off("touchmove", this.onTouchMove, this);
        this.node.off("touchend", this.onTouchEnd, this);
    }

    update(dt) {
        if (!this._touch) {
            return;
        }

        for (let index = this._arrayRope.length - 1; index >= 0; index--) {
            let script = this._arrayRope[index].getComponent(Joint);
            if (index == this._arrayRope.length - 1) {
                script.calcSelf(this._touchLocation);
            } else {
                let last = this._arrayRope[index + 1].getComponent(Joint);
                script.calcSelf(last.getSelfPoint());
            }
            script.calcTarget();
        }

        if (this.fixed) {
            this._arrayRope[0].getComponent(Joint).setSelfPoint(cc.Vec2.ZERO);

            for (let index = 1; index < this._arrayRope.length; index++) {
                let script = this._arrayRope[index].getComponent(Joint);
                let last = this._arrayRope[index - 1].getComponent(Joint);
                script.calcSelf(last.getSelfPoint());
                script.calcTarget();
            }
        }

        this._canvas.clear();
        for (let index = 0; index < this._arrayRope.length; index++) {
            let script = this._arrayRope[index].getComponent(Joint);

            let ptThis = script.getSelfPoint();
            let ptTarget = script.getTargetPoint();
            this._arrayRope[index].position.x = ptThis.x;
            this._arrayRope[index].position.y = ptThis.y;

            let tmpV: cc.Vec2 = null;
            tmpV = ptTarget.sub(ptThis);
            
            this._arrayRope[index].angle = Math.atan2(tmpV.y, tmpV.x) * 180 / Math.PI - 90;

            // this._canvas.moveTo(ptThis.x, ptThis.y);
            // this._canvas.lineTo(ptTarget.x, ptTarget.y);
            // this._canvas.circle(ptThis.x, ptThis.y, 1);
            // this._canvas.stroke();
        }
    }

    onTouchMove(event: cc.Event.EventTouch) {
        this._touch = true;
        this._touchLocation = this.nodeRope.convertToNodeSpaceAR(event.getLocation());
    }

    onTouchEnd(event: cc.Event.EventTouch) {
        this._touch = false;
    }
}
