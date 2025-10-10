# Zocial CSS social buttons

I basically rewrote this entire set so they are full vector buttons, meaning:

- @font-face icons
- custom font file for all social icons
- icon font use private unicode spaces for accessibility
- em sizing based on button font-size
- support for about 83 different services
- buttons and icons supported
- no raster images (sweet)
- works splendidly on any browser supporting @font-face
- CSS3 degrades gracefully in IE8 and below etc.
- also includes generic icon-less primary and secondary buttons

*[Demo](https://smcllns.github.io/css-social-buttons/)*

## How to use these buttons

```html
<button class="zocial facebook">Button label here</button>
```

or

```html
<a class="zocial twitter">Button label</a>
```

- Can be any element e.g. `a`, `div`, `button` etc.
- Add class of `.zocial`
- Add class for name of service e.g. `.dropbox`, `.twitter`, `.github`
- Done :-)

Check out [zocial.smcllns.com](http://zocial.smcllns.com) for code examples.

There's also a LESS version from @gustavohenke [here](https://github.com/gustavohenke/zocial-less)

Problems, questions or requests to [@smcllns](http://twitter.com/smcllns)

## CDN

This project is available on CDNJS:
https://cdnjs.com/libraries/css-social-buttons

## How to contribute

1. Install [Font Custom](https://github.com/FontCustom/fontcustom)
2. Add new font in the `src/` folder.
3. Set color settings in the `templates/zocial.css` file.
4. Run `fontcustom compile`
5. Update the `sample.html` file with both the button and icon.
6. Test rendering. If broken go to step 2.
7. Send pull-request !

## License

Under [MIT License](http://opensource.org/licenses/mit-license.php)
