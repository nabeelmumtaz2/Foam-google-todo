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
  package: 'foam.util.swift',
  name: 'SwiftSource',
  requires: [
    'foam.i18n.TranslationFormatStringParser',
    'foam.util.InlineTrait',
  ],

  methods: [
    function prepModel(model) {
      // Swift doesn't support traits, so we'll copy traits into the model directly.
      model = this.InlineTrait.create().inlineTraits(model);

      var filter = function(m) {
        if ( m.labels && m.labels.indexOf('swift') == -1 ) {
          return false;
        }
        return true;
      };

      model.properties = model.properties.filter(filter);
      model.methods = model.methods.filter(filter);
      model.listeners = model.listeners.filter(filter);
      model.messages = model.messages.filter(filter);

      return model;
    },
    function generate(model) {
      if ( model.swiftSource ) {
        return model.swiftSource();
      }
      return this.swiftSource.call(this.prepModel(model), undefined, this);
    },
    function genDetailView(model) {
      return this.detailView.call(this.prepModel(model), undefined, this);
    },
  ],

  templates: [
    function swiftSource(_, util) {/*<%
var parser = util.TranslationFormatStringParser.create({stringSymbol: '@'})
var escapeDoubleQuotes = function(s) {
  return s.replace(/"/g, '\\"');
};
var createNsLocalizedString = function(value, hint) {
  parser.value = escapeDoubleQuotes(value);
  parser.translationHint = escapeDoubleQuotes(hint);
  return 'NSLocalizedString("' +
      parser.parsedValue + '", comment: "'+ parser.parsedTranslationHint +'")'
}

var propertyMap = {}
var toPropertyMap = function(f) {
  propertyMap[f.name] = f;
}
this.properties.forEach(toPropertyMap);

var idName;
var modelProperties = [];
var overriddenProperties = [];
var runtimeProperties = this.getRuntimeProperties();
var parent = this.X.lookup(this.extends);
for ( var i = 0 ; i < runtimeProperties.length ; i++ ) {
  var prop = runtimeProperties[i];
  if (prop.name == 'id') { idName = prop.name; }
  if (prop.labels && (
    prop.labels.indexOf('compiletime') != -1 ||
    prop.labels.indexOf('swift') == -1 ) ) { continue; }
  if (parent && parent.getProperty(prop.name)) {
    if (propertyMap[prop.name]) {
      overriddenProperties.push(prop);
    }
    continue;
  }
  modelProperties.push(prop)
}
var allProperties = modelProperties.concat(overriddenProperties);
if (!idName) {
  if (this.ids && this.ids.length) {
    idName = this.ids[0];
  } else if(allProperties.length) {
    idName = allProperties[0].name;
  }
} else {
  // Since there's already an ID property, we don't need to do any special
  // handling of ID so unset it.
  idName = undefined;
}
%>// Generated by foam.util.swift.SwiftSource.  DO NOT MODIFY BY HAND
import Foundation
<% this.swiftClassImports.forEach(function(swiftImport) { %>
import <%= swiftImport %>
<% }) %>
public class <%= this.swiftClassName %>: <%= parent && parent.swiftClassName || 'FObject' %><%
if ( this.swiftImplements.length > 0 ) {
  %>, <% for ( var i = 0; i < this.swiftImplements.length - 1; i++ ) { %><%= this.swiftImplements[i] %>, <% } %><%= this.swiftImplements[i] %>
<% } %> {<%

for ( var i = 0, message; message = this.messages[i]; i++) {
%>
  static let <%= message.name %> = <%= createNsLocalizedString(message.value, message.translationHint) %><%
}

for (var i = 0, constant; constant = this.constants[i]; i++) {
  if (constant.swiftValue) {
%>
  static let <%= constant.name %><%= constant.swiftType ? ': ' + constant.swiftType : ''%> = <%= constant.swiftValue %><%
  }
}

for ( var i = 0 ; i < allProperties.length ; i++ ) {
  var prop = allProperties[i];
  var override = overriddenProperties.indexOf(prop) != -1 ? 'override' : '';
  var name = prop.name;
  var constant = constantize(name);
  var type = prop.swiftType;
  var propertyModel = (prop.model_.id || prop.model_.name).split('.').pop();
%>
  <% if (!override) { %>
  var <%= name %>_: <%= type %>?
  var <%= name %>Inited_ = false
  var <%= name %>Value_: PropertyValue?
  var <%= name %>$: PropertyValue {
    get {
      if self.<%= name %>Value_ == nil {
        self.<%= name %>Value_ = PropertyValue(obj: self, prop: "<%= name %>")
      }
      return self.<%= name %>Value_!
    }
    set(value) {
      Events.link(value, b: <%= name %>$)
    }
  }
  <% } %>
  static let <%= this.swiftClassName %>_<%= constant %>: <%= propertyModel %> = {
    var p = <%= propertyModel %>()
    p.name = "<%= name %>"
    p.label = <%
    if (prop.translationHint) {
      %><%= createNsLocalizedString(prop.label, prop.translationHint) %><%
    } else {
      %>"<%= prop.label %>"<%
    } %>
    p.speechLabel = <%
    if (prop.speechLabel == prop.label) {
      %>p.label<%
    } else if (prop.speechLabelTranslationHint) {
      %><%= createNsLocalizedString(prop.speechLabel, prop.speechLabelTranslationHint) %><%
    } else {
      %>"<%= prop.speechLabel %>"<%
    }
    if (prop.enum) { %>
    p.`enum` = <%= prop.enum.split('.').pop() %>.self<%
    }
    if (prop.help) {
      if (prop.translationHint) {%>
    p.help = NSLocalizedString("<%= prop.help %>",
        comment: "<%= prop.helpTranslationHint %>")<%
      } else {%>
    p.help = "<%= prop.help %>"<%
      }
    }
    if (prop.swiftValidate) { %>
    p.validate = FoamFunction(fn: { (args) -> AnyObject? in
      let data = args[0] as! <%= this.swiftClassName %>
      return data.validate_<%= name %>() as AnyObject
    })<%
    } %>
    return p
  }()
  <% if (prop.swiftValidate) { %>
  public <%= override %> func validate_<%= name %>() -> String? {
    let value = `<%= name %>`
    let property = `<%= constant %>`
    // No-ops to silence unused variable warning if they're not used in the valdation code.
    _ = value
    _ = property
    <%= multiline(prop.swiftValidate) %>
  }
  <% } %>
  public <%= override %> class var <%= constant %>: <%= propertyModel %> {
    get {
      return <%= this.swiftClassName %>_<%= constant %>
    }
  }
  public <%= override %> var <%= constant %>: <%= propertyModel %> {
    get {
      return <%= this.swiftClassName %>.<%= constant %>
    }
  }
  public <%= override %> var `<%= name %>` : <%= type %> {
    get {
  <% if (prop.swiftGetter) { %>
      <%= TemplateUtil.lazyCompile(TemplateUtil.expandTemplate(prop, prop.swiftGetter)).bind(prop)() %>
  <% } else { %>
      if <%= name %>Inited_ { return <%= name %>_! }
    <% if (prop.swiftFactory) { %>
      let factoryValue = { () -> AnyObject? in
        <%= TemplateUtil.lazyCompile(TemplateUtil.expandTemplate(prop, prop.swiftFactory)).bind(prop)() %>
      }()
      _  = self.set("<%= name %>", value: factoryValue)
      return <%= name %>_!
    <% } else if (prop.swiftDefaultValueFn) { %>
      <%= prop.swiftDefaultValueFn %>
    <% } else if (prop.swiftDefaultValue) { %>
      return <%= prop.swiftDefaultValue %>
    <% } else if (prop.swiftType.slice(-1).match(/[?!]/)) { %>
      return nil
    <% } else { %>
      fatalError("No default value for <%= prop.name %>")
    <% } %>
  <% } %>
    }
    set(value) {
      _ = self.set("<%= name %>", value: value as AnyObject?)
    }
  }
  public <%= override %> func _<%= name %>Adapt_(_ oldValue: AnyObject?, newValue: AnyObject?) -> <%= type %> {
    let closure = { (oldValue: AnyObject?, newValue: AnyObject?) -> <%= type %> in
      <%= TemplateUtil.lazyCompile(TemplateUtil.expandTemplate(prop, prop.swiftAdapt)).bind(prop)() %>
    }
    <% if (override) { %>
    return super._<%= name %>Adapt_(oldValue, newValue: closure(oldValue, newValue) as AnyObject?)
    <% } else { %>
    return closure(oldValue, newValue)
    <% } %>
  }
  public <%= override %> func _<%= name %>PreSet_(_ oldValue: AnyObject?, newValue: <%= type %>) -> <%= type %> {
    let closure = { (oldValue: AnyObject?, newValue: <%= type %>) -> <%= type %> in
      <%= TemplateUtil.lazyCompile(TemplateUtil.expandTemplate(prop, prop.swiftPreSet)).bind(prop)() %>
    }
    <% if (override) { %>
    return super._<%= name %>PreSet_(oldValue, newValue: closure(oldValue, newValue))
    <% } else { %>
    return closure(oldValue, newValue)
    <% } %>
  }
  public <%= override %> func _<%= name %>PostSet_(_ oldValue: AnyObject?, newValue: <%= type %>) {
    let closure = { (oldValue: AnyObject?, newValue: <%= type %>) in
      <%= TemplateUtil.lazyCompile(TemplateUtil.expandTemplate(prop, prop.swiftPostSet)).bind(prop)() %>
    }
    <% if (override) { %>
    super._<%= name %>PostSet_(oldValue, newValue: newValue)
    <% } %>
    closure(oldValue, newValue)
  }
<% } %>

  public override func hasOwnProperty(_ key: String) -> Bool {
    switch key {<%
for ( var i = 0 ; i < modelProperties.length; i++ ) {
  var prop = modelProperties[i];
%>
      case "<%= prop.name %>":
        return self.<%= prop.name %>Inited_<%
} %>
<% if (idName) { %>
      case "id":
        return hasOwnProperty("<%= idName %>")
<% } %>
      default:
        return super.hasOwnProperty(key)
    }
  }

  public override func getProperty(_ key: String) -> Property? {
    switch key {<%
for ( var i = 0 ; i < modelProperties.length; i++ ) {
  var prop = modelProperties[i];
%>
      case "<%= prop.name %>":
        return self.<%= constantize(prop.name) %><%
} %>
<% if (idName) { %>
      case "id":
        return getProperty("<%= idName %>")
<% } %>
      default:
        return super.getProperty(key)
    }
  }

  public override func getPropertyValue(_ key: String) -> PropertyValue? {
    switch key {<%
for ( var i = 0 ; i < modelProperties.length; i++ ) {
  var prop = modelProperties[i];
%>
      case "<%= prop.name %>":
        return self.<%= prop.name %>$<%
} %>
<% if (idName) { %>
      case "id":
        return getPropertyValue("<%= idName %>")
<% } %>
      default:
        return super.getPropertyValue(key)
    }
  }

  public override func get(_ key: String) -> AnyObject? {
    switch key {<%
for ( var i = 0 ; i < modelProperties.length; i++ ) {
  var prop = modelProperties[i];
%>
      case "<%= prop.name %>":
        return self.`<%= prop.name %>` as AnyObject?<%
} %>
<% if (idName) { %>
      case "id":
        return get("<%= idName %>")
<% } %>
      default:
        return super.get(key)
    }
  }

  public override func set(_ key: String, value: AnyObject?) -> FObject {
    switch key {<%
for ( var i = 0 ; i < modelProperties.length ; i++ ) {
  var prop = modelProperties[i];
  var name = prop.name;
%>
      case "<%= name %>":
        let oldValue = <%= name %>Inited_ ? `<%= name %>` as AnyObject? : nil as AnyObject?
        <%= name %>_ = _<%= name %>PreSet_(oldValue, newValue: _<%= name %>Adapt_(oldValue, newValue: value))
        <%= name %>Inited_ = true
        _<%= name %>PostSet_(oldValue, newValue: <%= name %>_!)
        self.firePropertyChangeEvent("<%= name %>", oldValue: oldValue, newValue: self.`<%= name %>` as AnyObject?)
<% } %>
<% if (idName) { %>
      case "id":
        return set("<%= idName %>", value: value)
<% } %>
      default: break
    }
    return super.set(key, value: value)
  }

  public override func clearProperty(_ key: String) -> FObject {
    switch key {<%
for ( var i = 0 ; i < modelProperties.length ; i++ ) {
  var prop = modelProperties[i];
  var name = prop.name;
%>
      case "<%= name %>":
        let oldValue = <%= name %>Inited_ ? `<%= name %>` as AnyObject? : nil as AnyObject?
        <%= name %>_ = nil
        <%= name %>Inited_ = false
        self.firePropertyChangeEvent("<%= name %>", oldValue: oldValue, newValue: self.`<%= name %>` as AnyObject?)
<% } %>
<% if (idName) { %>
      case "id":
        return clearProperty("<%= idName %>")
<% } %>
      default: break
    }
    return super.clearProperty(key)
  }

  public convenience init() {
    self.init(args: [:])
  }

  public override init(args: [String:AnyObject?] = [:]) {
    super.init(args: args)<%
for ( var i = 0, prop; prop = allProperties[i]; i++ ) {
  if (prop.swiftFactory) {%>
    _ = self.get("<%= prop.name %>")<%
  }
} %>
  }

  override public func encode(with aCoder: NSCoder) {
<%
for (var i = 0, prop; prop = modelProperties[i]; i++) {
  if (!prop.transient) {
%>
    if <%= prop.name %>Inited_ {
      <%= TemplateUtil.lazyCompile(TemplateUtil.expandTemplate(prop, prop.swiftNSCoderEncode)).bind(prop)() %>
    }
<%
  }
}
%>
    super.encode(with: aCoder)
  }

  required public init(coder aDecoder: NSCoder) {
    super.init(coder: aDecoder)
<%
for (var i = 0, prop; prop = modelProperties[i]; i++) {
  if (!prop.transient) {
%>
    if aDecoder.containsValue(forKey: "<%= prop.name %>") {
      <%= TemplateUtil.lazyCompile(TemplateUtil.expandTemplate(prop, prop.swiftNSCoderDecode)).bind(prop)() %>
    }
<%
  }
}
%>
  }

  public static var <%=this.swiftClassName%>Model_: Model = Model(name: "<%=this.swiftClassName%>",
      properties: [<%
  for ( var i = 0 ; i < modelProperties.length ; i++ ) {
    var prop = modelProperties[i]; %>
        <%=this.swiftClassName%>.<%= constantize(prop.name) %>,<%
  } %>
      ]<%= parent ? ' + ' + parent.swiftClassName + '.' + parent.swiftClassName + 'Model_.properties' : ''%>,
      factory: { return <%= this.swiftClassName %>() }
  )

  public override func getModel() -> Model {
    return <%=this.swiftClassName%>.<%=this.swiftClassName%>Model_
  }
<%
  function swiftSource(f) {
    f.swiftSource$f && f.swiftSource$f.call(f, out, self);
  }

  this.methods.forEach(swiftSource);
  this.listeners.forEach(swiftSource);
  this.actions.forEach(swiftSource);
%>

  <%= multiline(this.swiftCode) %>
}
*/},
  ],
});