
export const traverseFormFields = (form: any, callback: (item: any) => void) => {
  for (let item of form) {
    if (item.children) {
      traverseFormFields(item.children, callback)
    } else {
      callback(item)
    }
  }
}