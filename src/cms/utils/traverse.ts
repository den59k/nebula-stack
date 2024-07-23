import { Form, FormItem } from "../api/formsApi";

export const traverseFormFields = (form: Form["fields"], callback: (item: FormItem) => void) => {
  for (let item of form) {
    if (item.children) {
      traverseFormFields(item.children, callback)
    } else {
      callback(item)
    }
  }
}