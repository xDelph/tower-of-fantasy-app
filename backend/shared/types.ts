export interface Position {
  x: number;
  y: number;
}

export interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ResolutionConfig {
  activity_button: Position;
  activity_defi_tab: Position;
  activity_defi_caroussel_start: Position;
  activity_defi_caroussel_stop: Position;
  activity_defi_go: Position;
  activity_defi_group: Position;
  activity_defi_help: Position;
  activity_defi_accept: Position;
  conflit_auto: Position;
  conflit_exit: Position;
  conflit_confirm_exit: Position;
}
