export interface FlairInterface {
  id: string,
  low: number,
  high: number
}

export default class FlairMap {

  map:Array<FlairInterface> = [];

  constructor()
  {
    // $0 - $500k in increments of $50k;
    let inc = 5e4;
    this.registerFlair('dbac0bca-9f6d-11ed-8fb9-ae4141fc8052', 0, inc);
    this.registerFlair('e0da4dd2-9f6d-11ed-af14-c6078245f77f', 5e4, inc);
    this.registerFlair('e7cf547a-9f6d-11ed-ad37-2289303d7518', 1e5, inc);
    this.registerFlair('ebd4c1e0-9f6d-11ed-8ef5-26ac026fec70', 1.5e5, inc);
    this.registerFlair('f4736568-9f6d-11ed-9031-cad08fcc18a8', 2e5, inc);
    this.registerFlair('f88b8e64-9f6d-11ed-aa0a-76b8cefb6419', 2.5e5, inc);
    this.registerFlair('fd0962d6-9f6d-11ed-acef-b20b257c4d52', 3e5, inc);
    this.registerFlair('011820b0-9f6e-11ed-b657-aaca9109e5db', 3.5e5, inc);
    this.registerFlair('0499714e-9f6e-11ed-8d7d-02920c8d6107', 4e5, inc);
    this.registerFlair('081fa55e-9f6e-11ed-94a3-7e32846d369a', 4.5e5, inc);
    // $500k - $1mm in increments of $100k;
    inc = 1e5;
    this.registerFlair('0bb69b28-9f6e-11ed-947a-46fca514def4', 5e5, inc);
    this.registerFlair('0eb28bf2-9f6e-11ed-89d8-86e792985d33', 6e5, inc);
    this.registerFlair('131d3b74-9f6e-11ed-bb9a-3e0672b283e0', 7e5, inc);
    this.registerFlair('16f3c344-9f6e-11ed-95a2-fecb0de67bdb', 8e5, inc);
    this.registerFlair('1aaf1e48-9f6e-11ed-9f70-12516306a562', 9e5, inc);
    // $1mm - $2mm in increments of $250k;
    inc = 2.5e5
    this.registerFlair('2273424e-9f6e-11ed-8cba-aeb9532ba703', 1e6, inc);
    this.registerFlair('26c5d938-9f6e-11ed-b0a4-be3140e2c118', 1.25e6, inc);
    this.registerFlair('2af60712-9f6e-11ed-bff2-da16369cd457', 1.5e6, inc);
    this.registerFlair('2e9266c2-9f6e-11ed-9e49-56abd799f3cd', 1.75e6, inc);
    // $2mm - $5mm in increments of $500k;
    inc = 5e5;
    this.registerFlair('31cf4bfc-9f6e-11ed-a873-dedc27e1aad4', 2e6, inc);
    this.registerFlair('37e7b240-9f6e-11ed-9d11-96d4b4bc9dbe', 2.5e6, inc);
    this.registerFlair('42b39bd0-9f6e-11ed-8c62-3a23c43efe54', 3e6, inc);
    this.registerFlair('45f0379a-9f6e-11ed-beb0-96a121f44f45', 3.5e6, inc);
    this.registerFlair('48da3898-9f6e-11ed-b1fb-0ef66543872e', 4e6, inc);
    this.registerFlair('4c59817c-9f6e-11ed-87d4-ea25e62100bf', 4.5e6, inc);
    // $5mm - $10mm in increments of $1mm;
    inc = 1e6;
    this.registerFlair('4edd1c06-9f6e-11ed-845d-826a84fec813', 5e6, inc);
    this.registerFlair('521c4a68-9f6e-11ed-b667-5e2b25299481', 6e6, inc);
    this.registerFlair('557fd760-9f6e-11ed-865e-be3140e2c118', 7e6, inc);
    this.registerFlair('58251610-9f6e-11ed-a6fe-0af18278bec4', 8e6, inc);
    this.registerFlair('5a70c4fa-9f6e-11ed-8bee-d2d074ffff85', 9e6, inc);
    // >$10mm (10mm to 1 billion technically)
    this.registerFlair('5e1d18a6-9f6e-11ed-a6d1-c2952cab4660', 1e7);
  }

  private registerFlair(id: string, low:number, increment:number = Number.MAX_SAFE_INTEGER - low)
  {
    this.map.push({
      id: id,
      low: low,
      high: low + increment
    });
  }

  determineFlair(price:number)
  {
    return this.map.find(el => price >= el.low && price < el.high)?.id;
  }

}