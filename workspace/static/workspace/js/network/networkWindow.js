$.widget('viz.viznetwork', $.viz.vizbase, {
    options: {
    },
    _create: function() {
      this.options.base.resizeStop = this.resize.bind(this);
      this.options.extend.maximize = this.resize.bind(this);
      this.options.extend.restore  = this.resize.bind(this);
      this.options.extend.help = this.help;
      this.element.addClass('network');
      this._super('_create');

      this.setupUI();

      this.width = this.element.innerWidth(),
      this.height = this.element.innerHeight();

      this.network = wb.viz.network()
        .width(this.width)
        .height(this.height)
        .on('filter', this.onFilter.bind(this))
        .on('elaborate', this.onElaborate.bind(this))
        .on('delaborate', this.onDelaborate.bind(this));

      this.updateData();
      this.updateView();

      return this;
    },

    _destroy: function() {
      this._super('_destroy');
    },

    updateData: function() {
      // nodeMap: {nodeId: {entity}}
      // linkMap: {sourceId-targetId: {linkId: {relationship}}}
      var nodeMap = {}, linkMap = {};

      for (var id in wb.store.items.entities) {
        var entity = JSON.parse(JSON.stringify(wb.store.items.entities[id]));
        if (entity.meta.deleted) continue;
        if (!(id in nodeMap)) {
          nodeMap[id] = entity;
        }
      }
      for (var id in wb.store.items.relationships) {
        var relation = JSON.parse(JSON.stringify(wb.store.items.relationships[id]));
        if (relation.meta.deleted) continue;
        var source = relation.primary.source,
            target = relation.primary.target,
            key = source + '-' + target;

        if (!(key in linkMap)) {
          linkMap[key] = {};
        }

        relation.source = nodeMap[relation.primary.source];
        relation.target = nodeMap[relation.primary.target];
        relation.index = d3.keys(linkMap[key]).length + 1;
        linkMap[key][relation.meta.id] = relation;
      }

      var links = [];
      for (var st in linkMap) {
        links = links.concat(d3.values(linkMap[st]))
      }

      this.data = {nodes: d3.values(nodeMap), links: links};

      if (this.data.nodes.length) {
        this.element.find('#main').show();
        this.element.find('.placeholder').hide();

        d3.select(this.element[0])
          .select('svg#chart')
          .attr('width', this.width)
          .attr('height', this.height)
          .datum(this.data)
          .call(this.network);
      } else {
        this.element.find('#main').hide();
        this.element.find('.placeholder').show();
      }


      return this;
    },

    defilter: function() {
    },

    onFilter: function() {

    },

    onElaborate: function(d, pos) {
      if (d.primary.entity_type) {
        var entity = wb.store.items.entities[d.meta.id];
        wb.viewer.data(entity, 'entity').show(pos, 'network');
      } else {
        var relationship = wb.store.items.relationships[d.meta.id];
        wb.viewer.data(relationship, 'relationship').show(pos, 'network');
      }
    },

    onDelaborate: function() {
      wb.viewer.hide();
    },

    updateView: function() {
      if (this.data.nodes.length) {
        this.network.displaySome({nodes: wb.store.shelf.entities, links: wb.store.shelf.relationships});
      }
      return this;
    },

    setupUI: function() {
      var html = ' \
        <div id="filterBar"> \
        </div> \
        <div id="main"> \
          <svg id="chart" xmlns: "http://www.w3.org/2000/svg"> \
        </div> \
        <div class="jumbotron placeholder"> \
          <div class="container"> \
            <div class="text-center"> \
              <p>Add entities and relationships to display here</p> \
            </div> \
          </div> \
        </div> \
      ';
      var el = this.element;
      var _this = this;
      el.append(html);
      var li = d3.select(el[0]).select('#filterBar')
        .selectAll('.checkbox-inline')
        .data(wb.store.static.entity_types)
        .enter()
        .append('label')
        .attr('class', 'checkbox-inline')
        .on('click', onClickFilterOption);

      li.append('input')
        .attr('type', 'checkbox')
        .property('checked', true);
      li.append('text')
        .text(function(d) { return d; });

      function onClickFilterOption(d) {
        var entity_types = d3.select(el[0]).select('#filterBar').selectAll('input')
          .filter(function(d) {
            return this.checked;
          })
          .data();
        _this.network.displaySomeByType(entity_types);
      }
    },

    resize: function() {
      this._super('resize');
      this.width = this.element.innerWidth();
      this.height = this.element.innerHeight();

      if (this.data.nodes.length) {
        d3.select(this.element[0]).select('svg#chart')
          .attr('width', this.width)
          .attr('height', this.height)
          .call(this.network
            .width(this.width)
            .height(this.height));
      }

      return this;
    },

    help: function() {
      var hint = new EnjoyHint({});
      hint.set(wb.help.network);
      hint.run();
      return this;
    }
});
