$.widget('viz.viztimeline', $.viz.vizbase, {
    options: {
    },
    _create: function() {
      this.options.base.resizeStop = this.resize.bind(this);
      this.options.extend.maximize = this.resize.bind(this);
      this.options.extend.restore  = this.resize.bind(this);
      this.element.addClass('timeline');
      this._super('_create');

      this.setupUI();

      var width = this.element.innerWidth() - 20;
      var height = this.element.innerHeight() - 20;
      // this.timeline = wb.viz.timeline(this.element[0]).width(width).height(height);
      this.timeline = wb.viz.timeline()
        .width(width)
        .height(height)
        .on('filter', function() {
          $.publish('data/filter', '#' + this.element.attr('id'));
        }.bind(this))
      ;
      this.updateData();
      this.updateView();
      return this;
    },

    _destroy: function() {
      this._super('_destroy');
    },

    updateData: function() {
      var data = [];
      for (var d in wb.store.entities) {
        var entity = wb.store.entities[d];
        if (entity.primary.entity_type === 'event') {
          if (entity.primary.start_date) {
            data.push({
              start: entity.primary.start_date,
              end: entity.primary.end_date,
              label: entity.primary.name,
              id: entity.meta.id
            });
          }
        }
      }
      this.timeline.data(data);
      d3.select(this.element[0]).call(this.timeline);
    },

    updateView: function() {
      this.timeline.filter(wb.shelf.entities);
    },

    setupUI: function() {
      var html = ' \
        <ul class="controls"> \
          <li class="control filter" title="Filter"> \
        </ul> \
      ';
      this.element.append(html);

      var _this = this;

      this.element.find('.control').click(function() {
        $(this).toggleClass('selected');
        if ($(this).hasClass('selected')) {
          _this.timeline.setBrushMode();
        } else {
          _this.timeline.setNormalMode();
        }
      });
    },

    resize: function() {
      this._super('resize');
      var width = this.element.innerWidth() - 20;
      var height = this.element.innerHeight() - 20;
      this.timeline.width(width).height(height).redraw();
    }
});

