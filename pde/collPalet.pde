static class CPallet {
  final static color palet[] = {-16112830, -9360, -1083782, -6066800, -528406};
  final static color paletLight[] = {-11772043, -7017, -812130, -4418386, -396305};
  final static color paletDark[] = {-16246223, -4546478, -5351847, -8957847, -4936021};
  
  static color col(float i){
    return palet[round(i)];
  }
  
  static color col(int i){
    return palet[i];
  }
}
