const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    _ptSelf: cc.Vec2 = null;
    _ptTarget: cc.Vec2 = null;
    _angle: number = 0;
    _length: number = 0;

    init(x, y, length, angle) {
        this._ptSelf = cc.v2(x, y);
        this._length = this.node.height;
        this._angle = angle;

        this.calcTarget();
    }

    getTargetPoint() {
        return this._ptTarget;
    }

    setSelfPoint(point: cc.Vec2) {
        this._ptSelf = point;
        this.calcTarget();
    }

    getSelfPoint() {
        return this._ptSelf;
    }

    calcSelf(ptTarget: cc.Vec2) {
        let dir = ptTarget.sub(this._ptSelf).normalizeSelf();
        this._angle = Math.atan2(dir.y, dir.x);
        dir = dir.mul(-1 * this._length);
        this._ptSelf = ptTarget.add(dir);

        this.node.position = this._ptSelf;
    }

    calcTarget() {
        let dx = this._length * Math.cos(this._angle);
        let dy = this._length * Math.sin(this._angle);
        this._ptTarget = cc.v2(this._ptSelf.x + dx, this._ptSelf.y + dy);
    }
}
