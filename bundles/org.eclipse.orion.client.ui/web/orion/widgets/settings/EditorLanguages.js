/*******************************************************************************
 * @license
 * Copyright (c) 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License v1.0
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html).
 *
 * Contributors: Anton McConville - IBM Corporation - initial API and implementation
 ******************************************************************************/
/*eslint-env browser, amd*/
define("orion/widgets/settings/EditorLanguages", //$NON-NLS-0$
[
	'i18n!orion/settings/nls/messages', //$NON-NLS-0$
	'orion/section', //$NON-NLS-0$
	'orion/commands', //$NON-NLS-0$
	'orion/objects', //$NON-NLS-0$
	'orion/PageLinks',
	'orion/webui/littlelib', //$NON-NLS-0$
	'orion/widgets/input/SettingsTextfield', //$NON-NLS-0$
	'orion/widgets/input/SettingsCheckbox',  //$NON-NLS-0$
	'orion/widgets/input/SettingsSelect', //$NON-NLS-0$
	'orion/widgets/settings/Subsection', //$NON-NLS-0$
], function (messages, mSection, commands, objects, PageLinks, lib, SettingsTextfield, SettingsCheckbox, SettingsSelect, Subsection) {
	var KEY_MODES = [
		{value: "", label: messages.Default},
		{value: "Emacs", label: "Emacs"}, //$NON-NLS-1$ //$NON-NLS-2$
		{value: "vi", label: "vi"} //$NON-NLS-1$ //$NON-NLS-2$
	];

	var localIndicatorClass = "setting-local-indicator"; //$NON-NLS-0$
	var on = "on"; //$NON-NLS-0$
	var off = "off"; //$NON-NLS-0$
	function addLocalIndicator(widget, property, info, options, prefs, editorSettings) {
		if (!options.local) {
			var indicator = document.createElement("span"); //$NON-NLS-0$
			indicator.classList.add(localIndicatorClass);
			indicator.classList.add(prefs[property + "LocalVisible"] ? on : off); //$NON-NLS-0$
			indicator.title = messages.localSettingsTooltip;
			indicator.addEventListener("click", function(e) { //$NON-NLS-0$
				if (indicator.classList.contains(off)) {
					indicator.classList.add(on);
					indicator.classList.remove(off);
				} else {
					indicator.classList.add(off);
					indicator.classList.remove(on);
				}
				editorSettings.update();
			});
			var label = lib.$("label", widget.node); //$NON-NLS-0$
			label.parentNode.insertBefore(indicator, label);
		}
		return widget;
	}

	function createBooleanProperty(property, options, prefs, editorSettings) {
		return addLocalIndicator(new SettingsCheckbox(options), property, this, options, prefs, editorSettings);
	}

	function createIntegerProperty(property, options, prefs, editorSettings) {
		options.inputType = "integer"; //$NON-NLS-0$
		return addLocalIndicator(new SettingsTextfield(options), property, this, options, prefs, editorSettings);
	}

	function createSelectProperty(property, options, prefs, editorSettings) {
		var keys = this.values;
		options.options = [];
		for( var i= 0; i < keys.length; i++ ){
			var key = keys[i];
			var set = {
				value: key.value,
				label: key.label
			};
			if( key.value === prefs[property] ){
				set.selected = true;
			}
			options.options.push(set);
		}
		return addLocalIndicator(new SettingsSelect(options), property, this, options, prefs, editorSettings);
	}

	function validateIntegerProperty(property, prefs) {
		if (!(this.min <= prefs[property] && prefs[property] <= this.max)) {
			return messages[property + "Invalid"]; //$NON-NLS-0$
		}
		return "";
	}

	var sections = {
		EditorLanguages: {}
	};

	function EditorLanguages(options, node) {
		objects.mixin(this, options);
		this.node = node;
	}
	objects.mixin( EditorLanguages.prototype, {
		templateString: '<div class="sections"></div>', //$NON-NLS-0$
		commandTemplate:
				'<div id="commandButtons">' + //$NON-NLS-0$
					'<div id="editorCommands" class="layoutRight sectionActions"></div>' + //$NON-NLS-0$
				'</div>', //$NON-NLS-0$
		createElements: function() {
			this.node.innerHTML = this.templateString;
			this.sections = lib.$('.sections', this.node); //$NON-NLS-0$
			this.createSections();
			if (this.local) {
				this.sections.classList.add("local"); //$NON-NLS-0$
			} else {
				var commandArea = document.getElementById( 'pageActions' ); //$NON-NLS-0$
				commandArea.innerHTML = this.commandTemplate;
				this.createToolbar();
			}
		},
		createSections: function() {
//			var prefs = this.oldPrefs;
//			var fields = [], subSection, options, set, select;
//			var sectionWidget, subsectionWidget;
//			var themePreferences = this.themePreferences;

//			for (var section in sections) {
//				if (sections.hasOwnProperty(section)) {
//					if (!this.local) {
						var sectionWidget = new mSection.Section(this.sections, {
							id: "EditorLanguagesSection", //$NON-NLS-1$
							title: messages["EditorLanguages"],
							slideout: true
						});
						var infoText = document.createElement("div"); //$NON-NLS-0$
						infoText.classList.add("setting-info"); //$NON-NLS-0$
						infoText.textContent = messages.EditorLanguagesInfo;
//						var onIcon = document.createElement("span"); //$NON-NLS-0$
//						onIcon.classList.add(localIndicatorClass);
//						onIcon.classList.add(on);
//						var offIcon = document.createElement("span"); //$NON-NLS-0$
//						offIcon.classList.add(localIndicatorClass);
//						offIcon.classList.add(off);
//						var wrenchIcon = document.createElement("span"); //$NON-NLS-0$
//						wrenchIcon.classList.add("core-sprite-wrench"); //$NON-NLS-0$
//						wrenchIcon.classList.add("icon-inline"); //$NON-NLS-0$
//						wrenchIcon.classList.add("imageSprite"); //$NON-NLS-0$
//						lib.processDOMNodes(infoText, [onIcon, offIcon, wrenchIcon]);
						sectionWidget.getContentElement().appendChild(infoText);
//					}
//					for (var subsection in sections[section]) {
//						if (sections[section].hasOwnProperty(subsection)) {
//							for (var property in sections[section][subsection]) {
//								if (prefs[property + "Visible"] && (!this.local || prefs[property + "LocalVisible"])) { //$NON-NLS-1$ //$NON-NLS-2$
//									var info = sections[section][subsection][property];
//									options = {};
//									options.local = this.local;
//									options.fieldlabel = messages[property];
//									options.postChange = this.update.bind(this);
//									fields.push(info.widget = info.create(property, options, prefs, this));
//								}
//							}
//							if (!this.local && fields.length > 0) {
//								subsectionWidget = new Subsection( {sectionName:messages[subsection], parentNode: sectionWidget.getContentElement(), children: fields } );
//								subsectionWidget.show();
//								fields = [];
//							}
//						}
//					}
//				}
//			}
//			
//			if (this.local) {
//				var themeStyles = this.oldThemeStyles;
//				var orionHome = PageLinks.getOrionHome();
//				if (prefs.fontSizeVisible && (!this.local || prefs.fontSizeLocalVisible)) {
//					var fontSize = themeStyles.style.styles.fontSize;
//					options = [];
//					function fontSizes(unit) {
//						for( var size = 8; size < 19; size++ ){
//							set = {
//								value: size + unit,
//								label: size + unit
//							};
//							if( set.label === fontSize ){
//								set.selected = true;
//							}
//							options.push(set);
//						}
//					}
//					fontSizes("px"); //$NON-NLS-0$
//					fontSizes("pt"); //$NON-NLS-0$
//					select = this.sizeSelect = new SettingsSelect(
//						{	fieldlabel:messages["Font Size"], //$NON-NLS-0$
//							options:options,
//							postChange: themePreferences.setFontSize.bind(themePreferences)
//						}
//					);
//					fields.unshift(select);
//				}
//				if (prefs.themeVisible && (!this.local || prefs.themeLocalVisible)) {
//					var styles = themeStyles.styles;
//					options = [];
//					for( var theme= 0; theme < styles.length; theme++ ){
//						set = {
//							value: styles[theme].name,
//							label: messages[styles[theme].name + "ThemeName"] || styles[theme].name //$NON-NLS-0$
//						};
//						if( styles[theme].name === themeStyles.style.name ){
//							set.selected = true;
//						}
//						options.push(set);
//					}
//					options.push({value: "customize", label: messages['customizeTheme']}); //$NON-NLS-1$
//					select = this.themeSelect = new SettingsSelect(
//						{	fieldlabel:messages["Editor Theme"],
//							options:options,
//							postChange: function(){
//								if (select.select.value === "customize"){
//									window.open(orionHome + "/settings/settings.html#,category=themeSettings", "_self"); //$NON-NLS-1$ //$NON-NLS-2$
//								} else {
//									var setTheme = themePreferences.setTheme.bind(themePreferences);
//									setTheme(select.select.value);
//								}
//							}
//						}
//					);
//					fields.unshift(select);
//				}
//				if (!this.local && fields.length > 0) {
//					subSection = new Subsection( {sectionName:messages["Editor Theme"], parentNode: this.editorThemeSection.getContentElement(), children: fields} );
//					subSection.show();
//					fields = [];
//				}
//				
//				// Append all the settings content to the menu
//				fields.forEach(function(child) {
//					this.sections.appendChild( child.node );
//					child.show();
//				}.bind(this));
//				
//				// Add link to additional settings
//				var div = document.createElement("div");//$NON-NLS-0$
//				var labelSpan = document.createElement("span"); //$NON-NLS-1$
//				labelSpan.classList.add("setting-label"); //$NON-NLS-1$
//				div.appendChild(labelSpan);
//				var link = document.createElement("a"); //$NON-NLS-0$
//				link.classList.add('dropdownMenuItem'); //$NON-NLS-1$
//				link.href = orionHome + '/settings/settings.html#,category=editorSettings'; //$NON-NLS-1$;
//				link.textContent = messages['moreEditorSettings'];
//				link.style.float = "right"; //$NON-NLS-1$
//				link.addEventListener("keydown", function(e) { //$NON-NLS-0$
//					if (e.keyCode === lib.KEY.ENTER || e.keyCode === lib.KEY.SPACE) {	
//						link.click();
//					}
//				}, false);
//				div.appendChild(link);
//				this.sections.appendChild(div);
//			}
		},
		createToolbar: function() {
			var toolbar = lib.node( 'editorSettingsSectionToolActionsArea' ); //$NON-NLS-0$
			var importCommand = new commands.Command({
				name: messages.Import,
				tooltip: messages["Restore default Editor Settings"],
				id: "orion.importLanguageGrammar", //$NON-NLS-0$
				callback: function(data){
					this.restore(data.items);
				}.bind(this)
			});
			this.commandService.addCommand(importCommand);
			this.commandService.registerCommandContribution('restoreEditorSettingCommand', "orion.restoreeditorsettings", 2); //$NON-NLS-1$ //$NON-NLS-2$
			this.commandService.renderCommands('restoreEditorSettingCommand', toolbar, this, this, "button"); //$NON-NLS-2$ //$NON-NLS-1$
		},
		valueChanged: function() {
			var currentPrefs = {};
			for (var property in this.oldPrefs) {
				if (this.oldPrefs.hasOwnProperty(property)) {
					currentPrefs[property] = this.oldPrefs[property];
				}
			}
			this.getValues(currentPrefs);
			for (var prop in currentPrefs) {
				if (currentPrefs.hasOwnProperty(prop)) {
					if (currentPrefs[prop] !== this.oldPrefs[prop]) {
						return currentPrefs;
					}
				}
			}
			return undefined;
		},
		validate: function(prefs) {
			var msg = "";
			this._forEach(function(property, info) {
				if (info.validate) {
					msg = info.validate(property, prefs);
					if (msg) {
						return false;
					}
				}
				return true;
			});
			return msg;
		},
		_progress: function(msg, severity) {
			if (this.registry) {
				var messageService = this.registry.getService("orion.page.message"); //$NON-NLS-0$
				messageService.setProgressResult( {Message:msg, Severity:severity} );
			}
		},
		update: function() {
			var currentPrefs = this.valueChanged();
			if (currentPrefs) {
				var msg = this.validate(currentPrefs);
				if (msg) {
					this._progress(msg,"Error"); //$NON-NLS-0$
					return;
				}
				this.preferences.setPrefs(currentPrefs, function () {
					this.setValues(this.oldPrefs = currentPrefs);
					this._progress(messages["Editor preferences updated"], "Normal"); //$NON-NLS-0$
				}.bind(this));
			} else {
				this.setValues(this.oldPrefs);
			}
			if (this.editor) {
				this.editor.focus();
			}
		},
		restore: function() {
			this.preferences.setPrefs({}, function (editorPrefs){
				this._show(editorPrefs);
				this._progress(messages["Editor defaults restored"], "Normal"); //$NON-NLS-0$
			}.bind(this));
		},
		show: function(node, callback) {
			if (node) {
				this.node = node;
			}
			this.themePreferences.getTheme(function(themeStyles) {
				this.preferences.getPrefs(function (editorPrefs) {
					this._show(editorPrefs, themeStyles);
					if (callback) {
						callback();
					}
				}.bind(this));
			}.bind(this));
		},
		_show: function(editorPrefs, themeStyles) {
			if (themeStyles) {
				this.oldThemeStyles = themeStyles;
			}
			this.oldPrefs = editorPrefs;
			this.createElements();
			this.setValues(editorPrefs);
		},
		_forEach: function(callback) {
			for (var section in sections) {
				if (sections.hasOwnProperty(section)) {
					for (var subsection in sections[section]) {
						if (sections[section].hasOwnProperty(subsection)) {
							for (var property in sections[section][subsection]) {
								if (sections[section][subsection].hasOwnProperty(property)) {
									var info = sections[section][subsection][property];
									if (info.widget) {
										if (!callback(property, info)) {
											return;
										}
									}
								}
							}
						}
					}
				}
			}
		},
		getValues: function(editorPrefs) {
			this._forEach(function(property, info) {
				editorPrefs[property] = info.widget.getSelection();
				if (!this.local) {
					var indicator = lib.$("." + localIndicatorClass, info.widget.node); //$NON-NLS-0$
					editorPrefs[property + "LocalVisible"] = indicator && indicator.classList.contains(on); //$NON-NLS-1$ //$NON-NLS-0$
				}
				return true;
			}.bind(this));
		},
		setValues: function(editorPrefs) {
			this._forEach(function(property, info) {
				info.widget.setSelection(editorPrefs[property]);
				if (!this.local) {
					var indicator = lib.$("." + localIndicatorClass, info.widget.node); //$NON-NLS-0$
					if (indicator) {
						if (editorPrefs[property + "LocalVisible"]) { //$NON-NLS-0$
							indicator.classList.add(on);
							indicator.classList.remove(off);
						} else {
							indicator.classList.add(off);
							indicator.classList.remove(on);
						}
					}
				}
				return true;
			}.bind(this));
		},
		destroy: function() {
			if (this.node) {
				this.node = null;
			}
		}
	});

	return EditorLanguages;
});