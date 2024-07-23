import { Plugin } from "vue"
import VButton from "./components/VButton.vue"
import VCard from "./components/VCard.vue"
import VCheckbox from "./components/VCheckbox.vue"
import VCollapse from "./components/VCollapse.vue"
import VColorPicker from "./components/VColorPicker.vue"
import VContextMenu from "./components/VContextMenu.vue"
import VDialog from "./components/VDialog.vue"
import VDivider from "./components/VDivider.vue"
import VFileUploader from "./components/VFileUploader.vue"
import VFormControl from "./components/VFormControl.vue"
import VGrid from "./components/VGrid.vue"
import VIcon from "./components/VIcon.vue"
import VIconButton from "./components/VIconButton.vue"
import VInput from "./components/VInput.vue"
import VPopover from "./components/VPopover.vue"
import VProgressBar from "./components/VProgressBar.vue"
import VResizeArea from "./components/VResizeArea.vue"
import VScrollable from "./components/VScrollable.vue"
import VSelect from "./components/VSelect.vue"
import VSelectMultiple from "./components/VSelectMultiple.vue"
import VSlider from "./components/VSlider.vue"
import VSpinner from "./components/VSpinner.vue"
import VTable from "./components/VTable.vue"
import VTabs from "./components/VTabs.vue"
import VTabsPages from "./components/VTabsPages.vue"

export const registerComponents: Plugin = {
  install: (app) => {
    app.component("VButton", VButton)
    app.component("VCard", VCard)
    app.component("VCheckbox", VCheckbox)
    app.component("VCollapse", VCollapse)
    app.component("VColorPicker", VColorPicker)
    app.component("VContextMenu", VContextMenu)
    app.component("VDialog", VDialog)
    app.component("VDivider", VDivider)
    app.component("VFileUploader", VFileUploader)
    app.component("VFormControl", VFormControl)
    app.component("VGrid", VGrid)
    app.component("VIcon", VIcon)
    app.component("VIconButton", VIconButton)
    app.component("VInput", VInput)
    app.component("VPopover", VPopover)
    app.component("VProgressBar", VProgressBar)
    app.component("VResizeArea", VResizeArea)
    app.component("VScrollable", VScrollable)
    app.component("VSelect", VSelect)
    app.component("VSelectMultiple", VSelectMultiple)
    app.component("VSlider", VSlider)
    app.component("VSpinner", VSpinner)
    app.component("VTable", VTable)
    app.component("VTabs", VTabs)
    app.component("VTabsPages", VTabsPages)
  }
}




declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    VButton: typeof import("./components/VButton.vue")["default"]
    VCard: typeof import("./components/VCard.vue")["default"]
    VCheckbox: typeof import("./components/VCheckbox.vue")["default"]
    VCollapse: typeof import("./components/VCollapse.vue")["default"]
    VColorPicker: typeof import("./components/VColorPicker.vue")["default"]
    VContextMenu: typeof import("./components/VContextMenu.vue")["default"]
    VDialog: typeof import("./components/VDialog.vue")["default"]
    VDivider: typeof import("./components/VDivider.vue")["default"]
    VFileUploader: typeof import("./components/VFileUploader.vue")["default"]
    VFormControl: typeof import("./components/VFormControl.vue")["default"]
    VGrid: typeof import("./components/VGrid.vue")["default"]
    VIcon: typeof import("./components/VIcon.vue")["default"]
    VIconButton: typeof import("./components/VIconButton.vue")["default"]
    VInput: typeof import("./components/VInput.vue")["default"]
    VPopover: typeof import("./components/VPopover.vue")["default"]
    VProgressBar: typeof import("./components/VProgressBar.vue")["default"]
    VResizeArea: typeof import("./components/VResizeArea.vue")["default"]
    VScrollable: typeof import("./components/VScrollable.vue")["default"]
    VSelect: typeof import("./components/VSelect.vue")["default"]
    VSelectMultiple: typeof import("./components/VSelectMultiple.vue")["default"]
    VSlider: typeof import("./components/VSlider.vue")["default"]
    VSpinner: typeof import("./components/VSpinner.vue")["default"]
    VTable: typeof import("./components/VTable.vue")["default"]
    VTabs: typeof import("./components/VTabs.vue")["default"]
    VTabsPages: typeof import("./components/VTabsPages.vue")["default"]
  }
}
