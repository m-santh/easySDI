L.Control.ZoomBox = L.Control.extend({
    _active: false,
    _map: null,
    includes: L.Mixin.Events,
    options: {
        position: 'topleft',
        className: 'fa fa-search-plus',
        title: 'Zoom to specific area',
        modal: false
    },
    onAdd: function (map) {
        this._map = map;
        this._container = L.DomUtil.create('div', 'leaflet-zoom-box-control leaflet-bar');
        this._container.title = this.options.title;
        var link = L.DomUtil.create('a', this.options.className, this._container);
        link.href = "#";

        // Bind to the map's boxZoom handler
        var _origMouseDown = map.boxZoom._onMouseDown;
        map.boxZoom._onMouseDown = function (e) {
            _origMouseDown.call(map.boxZoom, {
                clientX: e.clientX,
                clientY: e.clientY,
                which: 1,
                shiftKey: true
            });
        };

        map.on('zoomend', function () {
            if (map.getZoom() == map.getMaxZoom()) {
                L.DomUtil.addClass(link, 'leaflet-disabled');
            } else {
                L.DomUtil.removeClass(link, 'leaflet-disabled');
            }
        }, this);
        if (!this.options.modal) {
            map.on('boxzoomend', this.deactivate, this);
        }

        L.DomEvent
            .on(this._container, 'dblclick', L.DomEvent.stop)
            .on(this._container, 'click', L.DomEvent.stop)
            .on(this._container, 'click', function () {
                this._active = !this._active;
                if (this._active && map.getZoom() != map.getMaxZoom()) {
                    this.activate();
                } else {
                    this.deactivate();
                }
            }, this);
        return this._container;
    },
    activate: function () {
        L.DomUtil.addClass(this._container, 'active');
        this._map.dragging.disable();
        this._map.boxZoom.addHooks();
        L.DomUtil.addClass(this._map.getContainer(), 'leaflet-zoom-box-crosshair');
    },
    deactivate: function () {

        L.DomUtil.removeClass(this._container, 'active');
        this._map.dragging.enable();
        this._map.boxZoom.removeHooks();
        var container = this._map.getContainer();
        setTimeout(function () {
            L.DomUtil.removeClass(container, 'leaflet-zoom-box-crosshair');
        }, 100);
        this._active = false;
        this._map.boxZoom._moved = false; //to get past issue w/ Leaflet locking clicks when moved is true (https://github.com/Leaflet/Leaflet/issues/3026).

    }
});

L.control.zoomBox = function (options) {
    return new L.Control.ZoomBox(options);
};