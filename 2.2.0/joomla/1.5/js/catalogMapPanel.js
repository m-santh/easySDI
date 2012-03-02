
CatalogMapPanel = Ext.extend(Ext.Panel, {	

			
	constructor: function( fieldsetId) {
	
		this.id = fieldsetId+"_BBox";
		this.fieldsetId = fieldsetId;
		Ext.getCmp(fieldsetId).add( new Ext.Panel( {
			id : fieldsetId+"_BBox",
			width : 500,
			height : 500,
			xtype: 'panel',			
			frame: false,
			style :{position:'relative',
			top:'30px',
			left:'0px',
			clear :'both'			
			
			}
			
		}));	
		
	}, 
	
	addMap : function(){
	
		OpenLayers.ProxyHost="/proxy/?url=";
	//	var maxBounds = new OpenLayers.Bounds(defaultBBoxConfig.defaultExtent.left,defaultBBoxConfig.defaultExtent.bottom,defaultBBoxConfig.defaultExtent.right,defaultBBoxConfig.defaultExtent.top);


		this.map = new OpenLayers.Map(Ext.getCmp(this.id).body.id, { controls: [] });

		if(defaultBBoxConfig!=""){
			var layerArray = defaultBBoxConfig.getLayers();//Ext.ux.util.clone(defaultBBoxConfig.layers);
			this.map.addLayers(layerArray);
		}
		else
			console.log("defaultBBoxConfig param is missing");

	
		this.map.addControl(new OpenLayers.Control.PanZoomBar());		

		this.map.navCtrl = new OpenLayers.Control.NavigationHistory();


		// parent control must be added to the map
		this.map.addControl(this.map.navCtrl);
		// Zoom in
		this.map.zoomInBoxCtrl = new OpenLayers.Control.ZoomBox();
		this.map.addControl( this.map.zoomInBoxCtrl);
		// Zoom out
		this.map.zoomOutBoxCtrl = new OpenLayers.Control.ZoomBox( {
			out : true
		});
		this.map.addControl(this.map.zoomOutBoxCtrl);

		

		this.updateManuallyTriggered = false;
		this.map.zoomToExtent(new OpenLayers.Bounds(defaultBBoxConfig.defaultExtent.left,defaultBBoxConfig.defaultExtent.bottom,defaultBBoxConfig.defaultExtent.right,defaultBBoxConfig.defaultExtent.top));

		var navCtrls = this.map.getControlsByClass('OpenLayers.Control.Navigation');
		for (var i = 0; i < navCtrls.length; i++) {
		navCtrls[i].disableZoomWheel();
		}
		
		for (i= 0; i<Ext.getCmp(this.fieldsetId).items.length; i++){
			if(	Ext.getCmp(this.fieldsetId).items.items[i].id.indexOf("east")>=0||
					Ext.getCmp(this.fieldsetId).items.items[i].id.indexOf("west")>=0||
					Ext.getCmp(this.fieldsetId).items.items[i].id.indexOf("north")>=0||
					Ext.getCmp(this.fieldsetId).items.items[i].id.indexOf("south")>=0){
				Ext.getCmp(this.fieldsetId).items.items[i].addListener("change", this.updateMapExtent, this);
			
			}
			else if (Ext.getCmp(this.fieldsetId).items.items[0].id.indexOf("undaries")>=0){
				Ext.getCmp(this.fieldsetId).items.items[i].addListener("select", this.updateMapExtent, this);
			}
			else{}
		}

		this.map.events.register('moveend', this, this.updateFieldset);


		
		

	}, 	
	
	addOverView: function(){
		
		//this.map.maxExtent = new OpenLayers.Bounds(defaultBBoxConfig.defaultExtent.left,defaultBBoxConfig.defaultExtent.bottom,defaultBBoxConfig.defaultExtent.right,defaultBBoxConfig.defaultExtent.top);
		//this.map.baseLayer.maxExtent = new OpenLayers.Bounds(defaultBBoxConfig.defaultExtent.left,defaultBBoxConfig.defaultExtent.bottom,defaultBBoxConfig.defaultExtent.right,defaultBBoxConfig.defaultExtent.top);

		this.map.maxExtent = this.map.getExtent();
		this.map.baseLayer.maxExtent = this.map.maxExtent;
	
			var bounds;
			var viewSize = new OpenLayers.Size(180, 100);			
			bounds = this.map.maxExtent;
	
			var overviewLayer = this.map.baseLayer.clone();
			overviewLayer.map = null;
			overviewLayer.maxExtent = bounds;
			overviewLayer.minExtent = bounds;
			var wRes = bounds.getWidth() / viewSize.w;
			var hRes = bounds.getHeight() / viewSize.h;
			maxResolution = Math.max(wRes, hRes);
		//maxResolution =overviewLayer.maxResolution ; 
			
			/*overviewLayer.scales = null;
			overviewLayer.minScale = null;
			overviewLayer.maxScale = null;*/

			ovControl = new OpenLayers.Control.OverviewMap({
				mapOptions :{
					maxExtent : bounds,
					restrictedExtent : bounds,
					maxResolution : maxResolution,
					minExtent : bounds,	
					minScale : null,
					maxScale : null,
					scales :null,					
					numZoomLevels :1,				
					center : bounds.getCenterLonLat()
					
				},
				layers : [overviewLayer],
				size : viewSize	
				
				
			});
			
			 
			// This forces the overview to never pan or zoom, since it
			// is always
			// suitable.
			ovControl.isSuitableOverview = function() {
				return true;
			};		
		
			this.map.addControl(ovControl);
		
	},

	updateMapExtent: function(){
		this.updateManuallyTriggered = true;
		var extent = new Array();
		var extentInvalid = false ;

		Ext.each(Ext.getCmp(this.fieldsetId).items.items, function(item, index) {
			if(item.id.indexOf("east")>=0){
				if(item.isValid())
					extent["east"]= item.getValue();
				else
					extentInvalid = true;

			}else if(item.id.indexOf("west")>=0){
				if(item.isValid())
					extent["west"]= item.getValue();	
				else					
					extentInvalid = true;

			}else if(item.id.indexOf("south")>=0){
				if(item.isValid())
					extent["south"]= item.getValue();	
				else
					extentInvalid = true;

			}else if(item.id.indexOf("north")>=0){
				if(item.isValid())
					extent["north"]= item.getValue();	
				else
					extentInvalid = true;

			}else{}
		});

		//left, bottom, right, top 
		if(!extentInvalid){
		var currentBounds = new OpenLayers.Bounds(extent["west"],extent["south"],extent["east"],extent["north"]);

		this.map.zoomToExtent(currentBounds);
		}else{
			this.updateManuallyTriggered = false;
		}

	},

	updateCtrlBtns : function() {
		if (this.navButton.pressed) {
			this.navCtrl.activate();
			// this.getFeatureInfoCtrl.activate();
		} else {
			this.navCtrl.deactivate();
			// this.getFeatureInfoCtrl.deactivate();
		}

		if (this.zoomInBoxButton.pressed) {
			this.zoomInBoxCtrl.activate();
		} else {
			this.zoomInBoxCtrl.deactivate();
		}
		if (this.zoomOutBoxButton.pressed) {
			this.zoomOutBoxCtrl.activate();
		} else {
			this.zoomOutBoxCtrl.deactivate();
		}

	},

	addToolbar : function(){

		// General tool bar items

		this.map.previousButton = new Ext.Toolbar.Button( {
			iconCls : 'previousBtn',

			handler : function() {
				this.map.navCtrl.previousTrigger();
			},
			scope : this
		});



		this.map.nextButton = new Ext.Toolbar.Button( {
			iconCls : 'nextBtn',

			handler : function() {
				this.map.navCtrl.nextTrigger();
			},
			scope : this
		});



		this.map.navButton = new Ext.Toolbar.Button( {
			iconCls : 'navBtn',

			enableToggle : true,
			toggleGroup : 'mapCtrl',
			allowDepress : false,
			handler : this.updateCtrlBtns,
			scope : this.map,
			pressed : true
		});



		this.map.zoomInBoxButton = new Ext.Toolbar.Button( {
			iconCls : 'zoomInBoxBtn',

			enableToggle : true,
			toggleGroup : 'mapCtrl',
			allowDepress : false,
			handler : this.updateCtrlBtns,
			scope : this.map
		});


		this.map.zoomOutBoxButton = new Ext.Toolbar.Button( {
			iconCls : 'zoomOutBoxBtn',

			enableToggle : true,
			toggleGroup : 'mapCtrl',
			allowDepress : false,
			handler : this.updateCtrlBtns,
			scope : this.map
		});



		Ext.getCmp(this.fieldsetId).add(
		new Ext.Toolbar( {
			id : this.fieldsetId+"_BBoxPanel",
			autoHeight : true,
			width : 500,
			height : 30,				
			frame: false,
			style :{position:'relative',			
				left:'0px',
				top:'-500px',
				clear :'both'
			},
			items : [ this.map.previousButton, this.map.nextButton, {
				xtype : 'tbseparator'
			}, this.map.zoomInBoxButton, this.map.zoomOutBoxButton,this.map.navButton
			]
		}));


	},
	
	updateItem: function(item, extent) {
		if(item.id.indexOf("east")>=0){

			item.setValue(extent["east"]);

		}else if(item.id.indexOf("west")>=0){

			item.setValue(extent["west"]);				

		}else if(item.id.indexOf("south")>=0){

			item.setValue(extent["south"]);				

		}else if(item.id.indexOf("north")>=0){

			item.setValue(extent["north"]);				

		}else if (item.getXType()=="combo"){
			item.setValue(); // setting the combobox to empty.
		}else{}
	},
	
	 updateFieldset: function () {		

			if(!this.updateManuallyTriggered){

				//console.log(map);
				var extent = new Array();
				var currentExtent = this.map.getExtent();
				extent["south"] = currentExtent.bottom ;
				extent["west"] = currentExtent.left ;
				extent["north"] = currentExtent.top ;
				extent["east"] = currentExtent.right ;

			//	console.log(Ext.getCmp(this.fieldsetId).items);
					
				for ( i =0; i< Ext.getCmp(this.fieldsetId).items.items.length ;i++  )
				this.updateItem(Ext.getCmp(this.fieldsetId).items.items[i], extent) ;
			}
			else
				this.updateManuallyTriggered = false;
	}



});
	
	
