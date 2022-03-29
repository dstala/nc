declare module "vue/types/options" {
  interface ComponentOptions<V extends Vue> {
    $tele: {
      emit:(event:string,data?) => void
    }
  }
}
