/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

CLASS({
  package: 'foam.swift.ui',
  name: 'DetailView',
  requires: [
    'foam.util.swift.SwiftSource',
  ],
  properties: [
    {
      name: 'id',
    },
    {
      name: 'name',
      defaultValueFn: function() {
        return this.id.split('.').pop();
      }
    },
    {
      name: 'package',
      defaultValueFn: function() {
        return this.id.split('.').slice(0, -1).join('.');
      }
    },
    {
      name: 'model',
      preSet: function(_, n) {
        var model = n;
        this.X.arequire(n)(function(m) {
          model = m;
        });
        return model;
      },
    },
  ],
  templates: [
    {
      name: 'swiftSource',
      labels: ['swift'],
      template: function() {/*
<%
var genProperties = [];
var model = this.SwiftSource.create().prepModel(this.model);
for ( var i = 0 ; i < model.properties.length ; i++ ) {
  var prop = model.properties[i];
  if (prop.labels.indexOf('compiletime') != -1) { continue; }
  if (!prop.swiftView) { continue; }
  if (prop.hidden) { continue; }
  genProperties.push(prop)
}
%>
// Generated by foam.swift.ui.DetailView.  DO NOT MODIFY BY HAND
import UIKit
class <%= this.name %>: UIView {

<% for (var i = 0, p; p = genProperties[i]; i++) { %>
  var <%= p.name %>Inited = false
  lazy var <%= p.name %>View: <%= p.swiftView %> = {
    self.<%=p.name %>Inited = true
    let v = <%= p.swiftView %>()
    if let pv = self.data.getPropertyValue("<%= p.name %>") {
      v.data$ = pv
    }
    return v
  }()

  @IBOutlet var <%= p.name %>Outlet: UIView? {
    didSet {
      _ = self.<%= p.name %>View.set("view", value: <%= p.name %>Outlet)
    }
  }

  lazy var <%= p.name %>Label: UILabel = {
    let v = UILabel()
    v.text = <%= model.swiftClassName %>.<%= constantize(p.name) %>.label
    return v
  }()
<% } %>

<% for (var i = 0, p; p = model.actions[i]; i++) { %>
  lazy var <%= p.name %>Button: UIButton = {
    let v = UIButton()
    v.addTarget(self,
        action: #selector(<%= this.name %>.<%=p.name%>Fn),
        for: UIControlEvents.touchUpInside)
    v.setTitleColor(UIColor.black, for: .normal)
    v.setTitleColor(UIColor.gray, for: .highlighted)
    v.setTitle("<%= p.label %>", for: .normal)
    return v
  }()
  func <%= p.name %>Fn() {
    data.<%= p.name %>()
  }
<% } %>

  lazy private var data_: <%= model.swiftClassName %> = {
    return <%= model.swiftClassName %>()
  }()

  var data: <%= model.swiftClassName %> {
    get { return data_ }
    set (value) {
<% for (var i = 0, p; p = genProperties[i]; i++) { %>
      if <%= p.name  %>Inited {
        if let pv = data_.getPropertyValue("<%= p.name %>") {
          Events.unlink(pv, b: self.<%= p.name %>View.data$)
        }
        if let pv = value.getPropertyValue("<%= p.name %>") {
          Events.link(pv, b: self.<%= p.name %>View.data$)
        }
      }
<% } %>
      data_ = value
    }
  }

  func addAutoConstraints() {

<% for (var i = 0, p; p = genProperties[i]; i++) { %>
    addSubview(<%= p.name %>View.view)
    <%= p.name %>View.view.translatesAutoresizingMaskIntoConstraints = false
    <%= p.name %>View.view.setContentCompressionResistancePriority(UILayoutPriorityDefaultHigh, for: .horizontal)
    addSubview(<%= p.name %>Label)
    <%= p.name %>Label.translatesAutoresizingMaskIntoConstraints = false
    <%= p.name %>Label.setContentHuggingPriority(UILayoutPriorityDefaultHigh, for: .horizontal)
<% } %>

<% for (var i = 0, p; p = model.actions[i]; i++) { %>
    addSubview(<%= p.name %>Button)
    <%= p.name %>Button.translatesAutoresizingMaskIntoConstraints = false
<% } %>

    let views: [String:UIView] = [
<% for (var i = 0, p; p = genProperties[i]; i++) { %>
    "<%= p.name %>View": <%= p.name %>View.view,
    "<%= p.name %>Label": <%= p.name %>Label,
<% } %>
<% for (var i = 0, p; p = model.actions[i]; i++) { %>
    "<%= p.name %>Button": <%= p.name %>Button,
<% } %>
    ]

    // Vertical constraints of views.
<%
var layoutVertically = function(view) {
%>
    addConstraints(NSLayoutConstraint.constraints(
      withVisualFormat: "V:|-[<%= view.join(']-[') %>]",
      options: NSLayoutFormatOptions.init(rawValue: 0),
      metrics: nil,
      views: views))
<%
};
var labels = genProperties.map(function(p) { return p.name + 'Label'; });
var actions = model.actions.map(function(a) { return a.name + 'Button'; }).slice(0,1);
layoutVertically(labels.concat(actions));
layoutVertically(genProperties.map(function(p) { return p.name + 'View'; }));
%>

    // Horizontal constraints of views.
<% for (var i = 0, p; p = genProperties[i]; i++) { %>
    addConstraints(NSLayoutConstraint.constraints(
      withVisualFormat: "H:|-[<%= p.name %>Label]-[<%= p.name %>View]-|",
      options: .alignAllCenterY,
      metrics: nil,
      views: views))
<% } %>
<% if (model.actions.length) { %>
  <% var actionButtonNameMap = function(o) { return o.name + 'Button'; }; %>
    // Horizontal constraints of actions.
    addConstraints(NSLayoutConstraint.constraints(
      withVisualFormat: "H:|-[<%= model.actions.map(actionButtonNameMap).join(']-[') %>]",
      options: .alignAllCenterY,
      metrics: nil,
      views: views))
<% } %>
  }
}
      */}
    },
  ]
});
