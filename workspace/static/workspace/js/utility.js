// override toString to easy display location entity
OpenLayers.Feature.Vector.prototype.toString = function() {
    return this.geometry.toString();
};


wb.utility = {};
(function() {
  var d3_color = d3.scale.category10();

  wb.utility.formatDate = function(d) {
    if (d) return d3.time.format("%b %d, %Y")(d);
    return '';
  };

  wb.utility.formatTime = function(d) {
    if (d) return d3.time.format("%I:%M:%p")(d);
    return '';
  };

  wb.utility.formatDateTime = function(d) {
    if (d) return d3.time.format("%b %d, %Y-%I:%M %p")(d);
    return '';
  };

  wb.utility.formatGeometry = function(entity) {
    if (entity.primary.geometry) {
      var wktParser = new OpenLayers.Format.WKT();
      var feature = wktParser.read(entity.primary.geometry);
      var origin_prj = new OpenLayers.Projection("EPSG:4326");
      var dest_prj   = new OpenLayers.Projection("EPSG:900913");
      if (feature) {
          feature.geometry.transform(origin_prj, dest_prj); // projection of google map
      }
      feature.attributes.id = entity.meta.id;
      feature.attributes.name = entity.primary.name;
      return feature;
    }
    return null;
  };

  wb.utility.capfirst = function(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
  };

  wb.utility.uniqueArray = function(arr) {
      return arr.filter(function(d, i, self) {
          return self.indexOf(d) === i;
      });
  };

  // a - b
  wb.utility.diffArray = function(a, b) {
    return a.filter(function(i) {return b.indexOf(i) < 0;});
  };

  wb.utility.Date = function(date) {
      return date ? new Date(date) : null;
  };

  wb.utility.randomColor = function(d) {
      return d3_color(d);
  }


  // Search for item in an array of items,
  // if the id of the item equals the id of
  // an item in items, return the index of
  // the item, if no item is found, return
  // -1. This function only returns
  // the first item that matches. Logically,
  // the id is unique in the system, so there
  // should be at most one item matches.
  wb.utility.indexOf = function(item, items) {
    for (var i = 0, len = items.length; i < len; i++) {
      if (item.id == items[i].id) {
        return i;
      }
    }
    return -1;
  };


  wb.utility.notify = function(msg, type, delay) {
    // type: success | info | warning | error
    if (type === 'error') type = 'danger';
    $('.notifications').notify({
      message: {text: msg},
      type: type || 'info',
      fadeOut: {enabled: true, delay: delay || 3000}
    }).show();
  };


  // return position relative to 'offsetEl'
  wb.utility.mousePosition = function(e, offsetEl) {
    var offset, _ref1;
    if ((_ref1 = $(offsetEl).css('position')) !== 'absolute' && _ref1 !== 'fixed' && _ref1 !== 'relative') {
      offsetEl = $(offsetEl).offsetParent()[0];
    }
    offset = $(offsetEl).offset();
    return {
      top: e.pageY - offset.top,
      left: e.pageX - offset.left
    };
  };


  // scroll to an element in a container
  wb.utility.scrollTo = function(ele, container) {
    if (ele.length == 0 || container.length == 0) return;
    $(container).animate({
      scrollTop: $(ele).offset().top - $(container).offset().top + $(container).scrollTop()
    });
  };


  wb.utility.parseEntityAttr = function(attr, value) {
    if (attr === 'person' || attr === 'organization') {
      value = value || [];
      value = value.map(function(d) {
        var ent = wb.store.items.entities[d];
        if (ent.meta.deleted) return '';
        return ent.primary.name;
      });
      value = value.join(', ');
    } else if (attr === 'location') {
      if (value) {
        var l = wb.store.items.entities[value];
        if (l.meta.deleted) value = '';
        else value = l.primary.name || l.primary.address;
      }
    } else if (attr === 'source' || attr === 'target') {
      if (value) {
        var e = wb.store.items.entities[value];
        value = e.meta.deleted ? '' : e.primary.name;
      }
    } else if (attr === 'created_by' || attr === 'last_edited_by') {
      if (value) value = wb.info.users[value].name;
    }
    return value || '';
  };

  wb.utility.toString = function(item, type) {
    if (item.constructor === Array) item = item[0];

    if (type === 'entity') {
      return item.primary.entity_type + ' ' + item.primary.name;
    } else if (type === 'relationship') {
      return item.primary.relation
                      + ' between '
                      + wb.store.items.entities[item.primary.source].primary.name
                      + ' and '
                      + wb.store.items.entities[item.primary.target].primary.name;
    }
  };

  wb.utility.uuid = function() {
    var d = Date.now();
    if(window.performance && typeof window.performance.now === "function"){
        d += performance.now(); //use high-precision timer if available
    }
    var uuid = 'xxxxxxxx_xxxx_4xxx_yxxx_xxxxxxxxxxxx'.replace(/[xy]/g, function(c) { // uuid is usually separeted by '-', I change it to '_'
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
  };

  wb.utility.getWindowState = function() {
    var state = [];
    $('.viz').each(function(i, v) {
      var width = $(v).dialog('option', 'width');
      var height = $(v).dialog('option', 'height');
      var position = $(v).dialog('option', 'position');
      var tool = $(v).data('instance').options.tool;
      state.push({
        width: width,
        height: height,
        position_my: position.my,
        position_at: position.at,
        tool: tool
      });
    });
    return state;
  };

  wb.utility.setWindowState = function(state) {
    var viz;
    state.forEach(function(v) {
      var t = v.tool;
      if (t === 'document') {
        viz = $('.viz.dataentry').length
          ? $('.viz.dataentry')
          : $('<div>').vizdataentrytable({ title: 'Documents', tool: 'document' });
      } else if (t === 'timeline') {
        viz = $('.viz.timeline').length
          ? $('.viz.timeline')
          : $('<div>').viztimeline({ title: 'Timeline', tool: 'timeline' });
      } else if (t === 'map') {
        viz = $('.viz.map').length
          ? $('.viz.map')
          : $('<div>').vizmap({ title: 'Map', tool: 'map' });
      } else if (t === 'network') {
        viz = $('.viz.network').length
          ? $('.viz.network')
          : $('<div>').viznetwork({ title: 'Network', tool: 'network' });
      } else if (t === 'notepad') {
        viz = $('.viz.notepad').length
          ? $('.viz.notepad')
          : $('<div>').viznotepad({ title: 'Notepad', tool: 'notepad', url: GLOBAL_URL.notepad, });
      } else if (t === 'message') {
        viz = $('.viz.message').length
          ? $('.viz.message')
          : $('<div>').vizmessage({ title: 'Message', tool: 'message' });
      } else if (t === 'history') {
        viz = $('.viz.history').length
          ? $('.viz.history')
          : $('<div>').vizhistory({ title: 'History', tool: 'history', url: GLOBAL_URL.history });
      } else if (t === 'annotation table') {
        viz = $('.viz.annotation').length
          ? $('.viz.annotation')
          : $('<div>').vizannotationtable({ title: 'Annotations', tool: 'annotation table', });
      } else {
        viz = $('.viz.entity').length
          ? $('.viz.entity')
          : $('<div>').vizentitytable({ title: t.split(' ')[0], entity: t.split(' ')[0], tool: t });
      }
      viz.dialog('option', {
        width: v.width,
        height: v.height,
        position: {
          at: v.position_at,
          my: v.position_my,
          of: window
        }
      });
      $(viz).data('instance').resize();
    });
  };

  wb.utility.getAllState = function() {
    var state = {};
    state.windowState = wb.utility.getWindowState();
    state.filter = wb.filter.filter;
    if ($('.viz.network').length) {
      state.networkState = $('.viz.network').data('instance').getState();
    }
    return state;
  };

  wb.utility.saveAllState = function() {
    var state = wb.utility.getWindowState();
    $.cookie('windowState', JSON.stringify(state));
    $.cookie('filter', JSON.stringify(wb.filter.filter));
    if ($('.viz.network').length) {
      var networkState = $('.viz.network').data('instance').getState();
      $.cookie('networkState', JSON.stringify(networkState));
    }
  };

  wb.utility.setAllState = function(state) {
    var windowState = state.windowState,
        filter = state.filter,
        networkState = state.networkState;
    if (!$.isEmptyObject(windowState)) {
      wb.utility.setWindowState(windowState);
    }
    if (!$.isEmptyObject(filter)) {
      for (var win in filter) {
        var content = filter[win];
        var tool = content.tool.split(' ') [0];
        var windowId = '#' + $('.viz.' + tool).attr('id');
        wb.filter.set(content.filter, tool, windowId);
      }
    } else {
      // remove all filter
      for (var win in wb.filter.filter) {
        wb.filter.remove(win);
      }
    }
    if (!$.isEmptyObject(networkState)) {
      if ($('.viz.network').length) {
        $('.viz.network').data('instance').setState(networkState);
      }
    }
  };

  wb.utility.loadAllState = function() {
    var windowState = JSON.parse($.cookie('windowState'));
    var filter = JSON.parse($.cookie('filter'));
    var networkState = JSON.parse($.cookie('networkState'));
    wb.utility.setAllState({
      windowState: windowState,
      filter: filter,
      networkState: networkState
    });
  }
})();
