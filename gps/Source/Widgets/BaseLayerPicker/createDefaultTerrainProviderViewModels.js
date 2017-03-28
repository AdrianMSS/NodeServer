/*global define*/
define([
        '../../Core/buildModuleUrl',
        '../../Core/EllipsoidTerrainProvider',
        '../BaseLayerPicker/ProviderViewModel'
    ], function(
        buildModuleUrl,
        EllipsoidTerrainProvider,
        ProviderViewModel) {
    "use strict";

    /**
     * @private
     */
    function createDefaultTerrainProviderViewModels() {
        var providerViewModels = [];
        providerViewModels.push(new ProviderViewModel({
            name : 'WGS84 Ellipsoid',
            iconUrl : buildModuleUrl('Widgets/Images/TerrainProviders/Ellipsoid.png'),
            tooltip : 'WGS84 standard ellipsoid, also known as EPSG:4326',
            creationFunction : function() {
                return new EllipsoidTerrainProvider();
            }
        }));

        return providerViewModels;
    }

    return createDefaultTerrainProviderViewModels;
});