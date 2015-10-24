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
        return wb.store.items.entities[d].primary.name;
      });
      value = value.join(', ');
    } else if (attr === 'location') {
      if (value) {
        var l = wb.store.items.entities[value];
        value = l.primary.name || l.primary.address;
      }
    } else if (attr === 'source' || attr === 'target') {
      if (value) {
        var e = wb.store.items.entities[value];
        value = e.primary.name;
      }
    } else if (attr === 'created_by' || attr === 'last_edited_by') {
      if (value) value = wb.info.users[value].name;
    }
    return value || '';
  };

  wb.utility.toString = function(item, type) {
    if (type === 'entity') {
      return item.primary.entity_type + ' ' + data.entity.primary.name;
    } else if (type === 'relationship') {
      return item.primary.relation
                      + ' between '
                      + wb.store.items.entities[data.relationship.primary.source].primary.name
                      + ' and '
                      + wb.store.items.entities[data.relationship.primary.target].primary.name);
    }
  }
})();
