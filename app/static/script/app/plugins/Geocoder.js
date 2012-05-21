/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the BSD license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = Geocoder
 */

/** api: (extends)
 *  gxp/plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: Geocoder(config)
 *
 *    Plugin for adding a GeocoderComboBox to a viewer. The underlying
 *    AutoCompleteComboBox can be configured by setting this tool's 
 *    ``outputConfig`` property.
 */
gxp.plugins.Geocoder = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = app_geocoder */
    ptype: "app_geocoder",
    
	outputConfig: {
		url: "/geoserver/wfs",
		featureType: "verblijfsobjecten",
		featurePrefix: "geo",
		srsName: "EPSG:28992",
		fieldName: "adres",
		geometryName: "geom",
		emptyText: "Zoek een adres ...",
		listEmptyText: "- niets gevonden -",
		customSortInfo: {
			matcher: "^[a-zA-Z]\\s+(\\d*)+.*$",
			//matcher: "^(\\d+)\\s+(.*)$",
			parts: [
				{order: 0, sortType: "asUCString"},
				{order: 1, sortType: "asInt"}
			]
		}
	},
	
	/** api: config[infoActionTip]
     *  ``String``
     *  Text for feature info action tooltip (i18n).
     */
    infoActionTip: "Zoek een adres ...",

    /** api: config[popupTitle]
     *  ``String``
     *  Title for info popup (i18n).
     */
    popupTitle: "Zoeken naar adres",

    /** api:config[zoom]
     * ``Integer`` Zoom level to zoom to when an address is selected.
     * Defaults to 16.
     */
    zoom: 8,

    init: function(target) {

        var combo = new gxp.form.AutoCompleteComboBox(Ext.apply({
        	width: 250,
        	selectOnFocus: true,
            listeners: {
                select: this.onComboSelect,
                scope: this
            }
        }, this.outputConfig));
        
        //var bounds = target.mapPanel.map.restrictedExtent;
        var bounds = target.mapPanel.map.maxExtent;
        if (bounds && !combo.bounds) {
            target.on({
                ready: function() {
                    combo.bounds = bounds.clone().transform(
                        target.mapPanel.map.getProjectionObject(),
                        new OpenLayers.Projection("EPSG:4326"));
                }
            });
        }
        this.combo = combo;
        
        return gxp.plugins.Geocoder.superclass.init.apply(this, arguments);

    },

    /** api: method[addOutput]
     */
    addOutput: function(config) {
        return gxp.plugins.Geocoder.superclass.addOutput.call(this, this.combo);
    },
    
    /** private: method[onComboSelect]
     *  Listener for combo's select event.
     */
    onComboSelect: function(combo, record) {
        var map = this.target.mapPanel.map;
        var location = record.get("feature").geometry;
        if (location instanceof OpenLayers.Geometry.Point) {
            map.setCenter(new OpenLayers.LonLat(location.x, location.y), this.zoom);
        }
    }

});

Ext.preg(gxp.plugins.Geocoder.prototype.ptype, gxp.plugins.Geocoder);
