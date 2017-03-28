/*global define*/
define([
        '../../Core/buildModuleUrl',
        '../../Scene/ArcGisMapServerImageryProvider',
        '../../Scene/BingMapsImageryProvider',
        '../../Scene/BingMapsStyle',
        '../BaseLayerPicker/ProviderViewModel'
    ], function(
        buildModuleUrl,
        ArcGisMapServerImageryProvider,
        BingMapsImageryProvider,
        BingMapsStyle,
        ProviderViewModel) {
    "use strict";

    /**
     * @private
     */
    function createDefaultImageryProviderViewModels() {
        var providerViewModels = [];
        providerViewModels.push(new ProviderViewModel({
            name : 'Bing Maps Aerial',
            iconUrl : buildModuleUrl('Widgets/Images/ImageryProviders/bingAerial.png'),
            tooltip : 'Bing Maps aerial imagery \nhttp://www.bing.com/maps',
            creationFunction : function() {
                return new BingMapsImageryProvider({
                    url : '//dev.virtualearth.net',
                    mapStyle : BingMapsStyle.AERIAL
                });
            }
        }));

        providerViewModels.push(new ProviderViewModel({
            name : 'ESRI National Geographic',
            iconUrl : buildModuleUrl('Widgets/Images/ImageryProviders/esriNationalGeographic.png'),
            tooltip : '\ National Geographic World Map service.\nhttp://www.esri.com',
            creationFunction : function() {
                return new ArcGisMapServerImageryProvider({
                    url : '//services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/',
                    enablePickFeatures : false
                });
            }
        }));

        return providerViewModels;
    }

    return createDefaultImageryProviderViewModels;
});