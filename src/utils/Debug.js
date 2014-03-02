/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2014 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* A collection of methods for displaying debug information about game objects. Phaser.Debug requires a CANVAS game type in order to render, so if you've got
* your game set to use Phaser.AUTO then swap it for Phaser.CANVAS to ensure WebGL doesn't kick in, then the Debug functions will all display.
*
* @class Phaser.Utils.Debug
* @constructor
* @param {Phaser.Game} game - A reference to the currently running game.
*/
Phaser.Utils.Debug = function (game) {

    /**
    * @property {Phaser.Game} game - A reference to the currently running Game.
    */
    this.game = game;
  
    /**
    * @property {PIXI.Sprite} sprite - If debugging in WebGL mode we need this.
    */
    this.sprite = null;

    /**
    * @property {HTMLCanvasElement} canvas - The canvas to which this BitmapData draws.
    */
    this.canvas = null;

    /**
    * @property {PIXI.BaseTexture} baseTexture - Required Pixi var.
    */
    this.baseTexture = null;
    
    /**
    * @property {PIXI.Texture} texture - Required Pixi var.
    */
    this.texture = null;

    /**
    * @property {Phaser.Frame} textureFrame - Dimensions of the renderable area.
    */
    this.textureFrame = null;

    /**
    * @property {CanvasRenderingContext2D} context - The 2d context of the canvas.
    */
    this.context = null;

    /**
    * @property {string} font - The font that the debug information is rendered in.
    * @default '14px Courier'
    */
    this.font = '14px Courier';
   
    /**
    * @property {number} columnWidth - The spacing between columns.
    */
    this.columnWidth = 100;

    /**
    * @property {number} lineHeight - The line height between the debug text.
    */
    this.lineHeight = 16;
    
    /**
    * @property {boolean} renderShadow - Should the text be rendered with a slight shadow? Makes it easier to read on different types of background.
    */
    this.renderShadow = true;
    
    /**
    * @property {Context} currentX - The current X position the debug information will be rendered at.
    * @default
    */
    this.currentX = 0;
    
    /**
    * @property {number} currentY - The current Y position the debug information will be rendered at.
    * @default
    */
    this.currentY = 0;
    
    /**
    * @property {number} currentAlpha - The current alpha the debug information will be rendered at.
    * @default
    */
    this.currentAlpha = 1;

    if (this.game.renderType === Phaser.CANVAS)
    {
        this.context = this.game.context;
    }
    else
    {
        this.canvas = Phaser.Canvas.create(this.game.width, this.game.height, '', true);
        this.context = this.canvas.getContext('2d');
        this.context.fillStyle = '#ff0000';
        this.context.fillRect(0,0,400,400);
        this.baseTexture = new PIXI.BaseTexture(this.canvas);
        this.texture = new PIXI.Texture(this.baseTexture);
        this.textureFrame = new Phaser.Frame(0, 0, 0, this.game.width, this.game.height, 'debug', game.rnd.uuid());
        this.sprite = this.game.make.image(0, 0, this.texture, this.textureFrame);

        this.game.stage.addChild(this.sprite);
    }

};

Phaser.Utils.Debug.prototype = {

    /**
    * Internal method that resets and starts the debug output values.
    * @method Phaser.Utils.Debug#start
    * @param {number} [x=0] - The X value the debug info will start from.
    * @param {number} [y=0] - The Y value the debug info will start from.
    * @param {string} [color='rgb(255,255,255)'] - The color the debug text will drawn in.
    * @param {number} [columnWidth=0] - The spacing between columns.
    */
    start: function (x, y, color, columnWidth) {

        if (this.context === null)
        {
            return;
        }

        if (typeof x !== 'number') { x = 0; }
        if (typeof y !== 'number') { y = 0; }
        color = color || 'rgb(255,255,255)';
        if (typeof columnWidth === 'undefined') { columnWidth = 0; }

        this.currentX = x;
        this.currentY = y;
        this.currentColor = color;
        this.currentAlpha = this.context.globalAlpha;
        this.columnWidth = columnWidth;

        this.context.save();
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.strokeStyle = color;
        this.context.fillStyle = color;
        this.context.font = this.font;
        this.context.globalAlpha = 1;

    },

    /**
    * Internal method that stops the debug output.
    * @method Phaser.Utils.Debug#stop
    */
    stop: function () {

        this.context.restore();
        this.context.globalAlpha = this.currentAlpha;

        if (this.sprite)
        {
            this.context.fillStyle = '#ff0000';
            this.context.fillRect(0,0,400,400);
            PIXI.updateWebGLTexture(this.baseTexture, this.game.renderer.gl);
        }

    },

    /**
    * Internal method that outputs a single line of text.
    * @method Phaser.Utils.Debug#line
    * @param {string} text - The line of text to draw.
    * @param {number} [x] - The X value the debug info will start from.
    * @param {number} [y] - The Y value the debug info will start from.
    */
    line: function (text, x, y) {

        if (this.context === null)
        {
            return;
        }

        if (typeof x !== 'undefined') { this.currentX = x; }
        if (typeof y !== 'undefined') { this.currentY = y; }

        if (this.renderShadow)
        {
            this.context.fillStyle = 'rgb(0,0,0)';
            this.context.fillText(text, this.currentX + 1, this.currentY + 1);
            this.context.fillStyle = this.currentColor;
        }

        this.context.fillText(text, this.currentX, this.currentY);
        this.currentY += this.lineHeight;

    },

    /**
    * Internal method that outputs a single line of text split over as many columns as needed, one per parameter.
    * @method Phaser.Utils.Debug#splitline
    * @param {string} text - The text to render. You can have as many columns of text as you want, just pass them as additional parameters.
    */
    splitline: function (text) {

        if (this.context === null)
        {
            return;
        }

        var x = this.currentX;

        for (var i = 0; i < arguments.length; i++)
        {
            if (this.renderShadow)
            {
                this.context.fillStyle = 'rgb(0,0,0)';
                this.context.fillText(arguments[i], x + 1, this.currentY + 1);
                this.context.fillStyle = this.currentColor;
            }

            this.context.fillText(arguments[i], x, this.currentY);

            x += this.columnWidth;
        }

        this.currentY += this.lineHeight;

    },

    /**
    * Render Sound information, including decoded state, duration, volume and more.
    * @method Phaser.Utils.Debug#renderSoundInfo
    * @param {Phaser.Sound} sound - The sound object to debug.
    * @param {number} x - X position of the debug info to be rendered.
    * @param {number} y - Y position of the debug info to be rendered.
    * @param {string} [color='rgb(255,255,255)'] - color of the debug info to be rendered. (format is css color string).
    */
    renderSoundInfo: function (sound, x, y, color) {

        if (this.context === null)
        {
            return;
        }

        color = color || 'rgb(255,255,255)';

        this.start(x, y, color);
        this.line('Sound: ' + sound.key + ' Locked: ' + sound.game.sound.touchLocked);
        this.line('Is Ready?: ' + this.game.cache.isSoundReady(sound.key) + ' Pending Playback: ' + sound.pendingPlayback);
        this.line('Decoded: ' + sound.isDecoded + ' Decoding: ' + sound.isDecoding);
        this.line('Total Duration: ' + sound.totalDuration + ' Playing: ' + sound.isPlaying);
        this.line('Time: ' + sound.currentTime);
        this.line('Volume: ' + sound.volume + ' Muted: ' + sound.mute);
        this.line('WebAudio: ' + sound.usingWebAudio + ' Audio: ' + sound.usingAudioTag);

        if (sound.currentMarker !== '')
        {
            this.line('Marker: ' + sound.currentMarker + ' Duration: ' + sound.duration);
            this.line('Start: ' + sound.markers[sound.currentMarker].start + ' Stop: ' + sound.markers[sound.currentMarker].stop);
            this.line('Position: ' + sound.position);
        }

        this.stop();

    },

    /**
    * Render camera information including dimensions and location.
    * @method Phaser.Utils.Debug#renderCameraInfo
    * @param {Phaser.Camera} camera - Description.
    * @param {number} x - X position of the debug info to be rendered.
    * @param {number} y - Y position of the debug info to be rendered.
    * @param {string} [color='rgb(255,255,255)'] - color of the debug info to be rendered. (format is css color string).
    */
    renderCameraInfo: function (camera, x, y, color) {

        if (this.context === null)
        {
            return;
        }

        color = color || 'rgb(255,255,255)';

        this.start(x, y, color);
        this.line('Camera (' + camera.width + ' x ' + camera.height + ')');
        this.line('X: ' + camera.x + ' Y: ' + camera.y);
        this.line('Bounds x: ' + camera.bounds.x + ' Y: ' + camera.bounds.y + ' w: ' + camera.bounds.width + ' h: ' + camera.bounds.height);
        this.line('View x: ' + camera.view.x + ' Y: ' + camera.view.y + ' w: ' + camera.view.width + ' h: ' + camera.view.height);
        this.stop();
        
    },

    /**
    * Renders the Pointer.circle object onto the stage in green if down or red if up along with debug text.
    * @method Phaser.Utils.Debug#renderPointer
    * @param {Phaser.Pointer} pointer - Description.
    * @param {boolean} [hideIfUp=false] - Doesn't render the circle if the pointer is up.
    * @param {string} [downColor='rgba(0,255,0,0.5)'] - The color the circle is rendered in if down.
    * @param {string} [upColor='rgba(255,0,0,0.5)'] - The color the circle is rendered in if up (and hideIfUp is false).
    * @param {string} [color='rgb(255,255,255)'] - color of the debug info to be rendered. (format is css color string).
    */
    renderPointer: function (pointer, hideIfUp, downColor, upColor, color) {

        if (this.context === null || pointer == null)
        {
            return;
        }

        if (typeof hideIfUp === 'undefined') { hideIfUp = false; }
        downColor = downColor || 'rgba(0,255,0,0.5)';
        upColor = upColor || 'rgba(255,0,0,0.5)';
        color = color || 'rgb(255,255,255)';

        if (hideIfUp === true && pointer.isUp === true)
        {
            return;
        }

        this.start(pointer.x, pointer.y - 100, color);
        this.context.beginPath();
        this.context.arc(pointer.x, pointer.y, pointer.circle.radius, 0, Math.PI * 2);

        if (pointer.active)
        {
            this.context.fillStyle = downColor;
        }
        else
        {
            this.context.fillStyle = upColor;
        }

        this.context.fill();
        this.context.closePath();

        //  Render the points
        this.context.beginPath();
        this.context.moveTo(pointer.positionDown.x, pointer.positionDown.y);
        this.context.lineTo(pointer.position.x, pointer.position.y);
        this.context.lineWidth = 2;
        this.context.stroke();
        this.context.closePath();

        //  Render the text
        // this.start(pointer.x, pointer.y - 100, color);
        this.line('ID: ' + pointer.id + " Active: " + pointer.active);
        this.line('World X: ' + pointer.worldX + " World Y: " + pointer.worldY);
        this.line('Screen X: ' + pointer.x + " Screen Y: " + pointer.y);
        this.line('Duration: ' + pointer.duration + " ms");
        this.line('is Down: ' + pointer.isDown + " is Up: " + pointer.isUp);
        this.stop();

    },

    /**
    * Render Sprite Input Debug information.
    * @method Phaser.Utils.Debug#renderSpriteInputInfo
    * @param {Phaser.Sprite} sprite - The sprite to be rendered.
    * @param {number} x - X position of the debug info to be rendered.
    * @param {number} y - Y position of the debug info to be rendered.
    * @param {string} [color='rgb(255,255,255)'] - color of the debug info to be rendered. (format is css color string).
    */
    renderSpriteInputInfo: function (sprite, x, y, color) {

        if (this.context === null)
        {
            return;
        }

        color = color || 'rgb(255,255,255)';

        this.start(x, y, color);
        this.line('Sprite Input: (' + sprite.width + ' x ' + sprite.height + ')');
        this.line('x: ' + sprite.input.pointerX().toFixed(1) + ' y: ' + sprite.input.pointerY().toFixed(1));
        this.line('over: ' + sprite.input.pointerOver() + ' duration: ' + sprite.input.overDuration().toFixed(0));
        this.line('down: ' + sprite.input.pointerDown() + ' duration: ' + sprite.input.downDuration().toFixed(0));
        this.line('just over: ' + sprite.input.justOver() + ' just out: ' + sprite.input.justOut());
        this.stop();

    },

    /**
    * Renders Phaser.Key object information.
    * @method Phaser.Utils.Debug#renderKey
    * @param {Phaser.Key} key - The Key to render the information for.
    * @param {number} x - X position of the debug info to be rendered.
    * @param {number} y - Y position of the debug info to be rendered.
    * @param {string} [color='rgb(255,255,255)'] - color of the debug info to be rendered. (format is css color string).
    */
    renderKey: function (key, x, y, color) {

        if (this.context === null)
        {
            return;
        }

        color = color || 'rgb(255,255,255)';

        this.start(x, y, color, 150);

        this.splitline('Key:', key.keyCode, 'isDown:', key.isDown);
        this.splitline('justPressed:', key.justPressed(), 'justReleased:', key.justReleased());
        this.splitline('Time Down:', key.timeDown.toFixed(0), 'duration:', key.duration.toFixed(0));

        this.stop();

    },

    /**
    * Render debug information about the Input object.
    * @method Phaser.Utils.Debug#renderInputInfo
    * @param {number} x - X position of the debug info to be rendered.
    * @param {number} y - Y position of the debug info to be rendered.
    * @param {string} [color='rgb(255,255,255)'] - color of the debug info to be rendered. (format is css color string).
    */
    renderInputInfo: function (x, y, color) {

        if (this.context === null)
        {
            return;
        }

        color = color || 'rgb(255,255,0)';

        this.start(x, y, color);
        this.line('Input');
        this.line('X: ' + this.game.input.x + ' Y: ' + this.game.input.y);
        this.line('World X: ' + this.game.input.worldX + ' World Y: ' + this.game.input.worldY);
        this.line('Scale X: ' + this.game.input.scale.x.toFixed(1) + ' Scale Y: ' + this.game.input.scale.x.toFixed(1));
        this.line('Screen X: ' + this.game.input.activePointer.screenX + ' Screen Y: ' + this.game.input.activePointer.screenY);
        this.stop();

    },

    /**
    * Renders the Sprites bounds. Note: This is really expensive as it has to calculate the bounds every time you call it!
    * @method Phaser.Utils.Debug#renderSpriteBounds
    * @param {Phaser.Sprite} sprite - Description.
    * @param {string} [color] - Color of the debug info to be rendered (format is css color string).
    * @param {boolean} [filled=true] - Render the rectangle as a fillRect (default, true) or a strokeRect (false)
    */
    renderSpriteBounds: function (sprite, color, filled) {

        var bounds = sprite.getBounds();

        this.renderRectangle(bounds, color, filled);

    },

    /**
    * Render debug infos (including name, bounds info, position and some other properties) about the Sprite.
    * @method Phaser.Utils.Debug#renderSpriteInfo
    * @param {Phaser.Sprite} sprite - Description.
    * @param {number} x - X position of the debug info to be rendered.
    * @param {number} y - Y position of the debug info to be rendered.
    * @param {string} [color='rgb(255,255,255)'] - color of the debug info to be rendered. (format is css color string).
    */
    renderSpriteInfo: function (sprite, x, y, color) {

        if (this.context === null)
        {
            return;
        }

        color = color || 'rgb(255, 255, 255)';

        this.start(x, y, color);

        this.line('Sprite: ' + ' (' + sprite.width + ' x ' + sprite.height + ') anchor: ' + sprite.anchor.x + ' x ' + sprite.anchor.y);
        this.line('x: ' + sprite.x.toFixed(1) + ' y: ' + sprite.y.toFixed(1));
        this.line('angle: ' + sprite.angle.toFixed(1) + ' rotation: ' + sprite.rotation.toFixed(1));
        this.line('visible: ' + sprite.visible + ' in camera: ' + sprite.inCamera);

        this.stop();

    },

    /**
    * Renders the sprite coordinates in local, positional and world space.
    * @method Phaser.Utils.Debug#renderSpriteCoords
    * @param {Phaser.Sprite} line - The sprite to inspect.
    * @param {number} x - X position of the debug info to be rendered.
    * @param {number} y - Y position of the debug info to be rendered.
    * @param {string} [color='rgb(255,255,255)'] - color of the debug info to be rendered. (format is css color string).
    */
    renderSpriteCoords: function (sprite, x, y, color) {

        if (this.context === null)
        {
            return;
        }

        color = color || 'rgb(255, 255, 255)';

        this.start(x, y, color, 100);

        if (sprite.name)
        {
            this.line(sprite.name);
        }

        this.splitline('x:', sprite.x.toFixed(2), 'y:', sprite.y.toFixed(2));
        this.splitline('pos x:', sprite.position.x.toFixed(2), 'pos y:', sprite.position.y.toFixed(2));
        this.splitline('world x:', sprite.world.x.toFixed(2), 'world y:', sprite.world.y.toFixed(2));

        this.stop();

    },

    /**
    * Renders a Line object in the given color.
    * @method Phaser.Utils.Debug#renderLine
    * @param {Phaser.Line} line - The Line to render.
    * @param {string} [color='rgb(255,255,255)'] - color of the debug info to be rendered. (format is css color string).
    */
    renderLine: function (line, color) {

        if (this.context === null)
        {
            return;
        }

        color = color || 'rgb(255, 255, 255)';

        this.start(0, 0, color);
        this.context.lineWidth = 1;
        this.context.beginPath();
        this.context.moveTo(line.start.x + 0.5, line.start.y + 0.5);
        this.context.lineTo(line.end.x + 0.5, line.end.y + 0.5);
        this.context.closePath();
        this.context.stroke();
        this.stop();

    },

    /**
    * Renders Line information in the given color.
    * @method Phaser.Utils.Debug#renderLineInfo
    * @param {Phaser.Line} line - The Line to render.
    * @param {number} x - X position of the debug info to be rendered.
    * @param {number} y - Y position of the debug info to be rendered.
    * @param {string} [color='rgb(255,255,255)'] - color of the debug info to be rendered. (format is css color string).
    */
    renderLineInfo: function (line, x, y, color) {

        if (this.context === null)
        {
            return;
        }

        color = color || 'rgb(255, 255, 255)';

        this.start(x, y, color, 80);
        this.splitline('start.x:', line.start.x.toFixed(2), 'start.y:', line.start.y.toFixed(2));
        this.splitline('end.x:', line.end.x.toFixed(2), 'end.y:', line.end.y.toFixed(2));
        this.splitline('length:', line.length.toFixed(2), 'angle:', line.angle);
        this.stop();

    },

    /**
    * Renders Point coordinates in the given color.
    * @method Phaser.Utils.Debug#renderPointInfo
    * @param {Phaser.Point} sprite - Description.
    * @param {number} x - X position of the debug info to be rendered.
    * @param {number} y - Y position of the debug info to be rendered.
    * @param {string} [color='rgb(255,255,255)'] - color of the debug info to be rendered. (format is css color string).
    */
    renderPointInfo: function (point, x, y, color) {

        if (this.context === null)
        {
            return;
        }

        color = color || 'rgb(255, 255, 255)';

        this.start(x, y, color);
        this.line('px: ' + point.x.toFixed(1) + ' py: ' + point.y.toFixed(1));
        this.stop();

    },

    /**
    * Renders a single pixel.
    * @method Phaser.Utils.Debug#renderPixel
    * @param {number} x - X position of the debug info to be rendered.
    * @param {number} y - Y position of the debug info to be rendered.
    * @param {string} [color] - Color of the debug info to be rendered (format is css color string).
    */
    renderPixel: function (x, y, color) {

        if (this.context === null)
        {
            return;
        }

        color = color || 'rgba(0,255,0,1)';

        this.start();
        this.context.fillStyle = color;
        this.context.fillRect(x, y, 2, 2);
        this.stop();

    },

    /**
    * Renders a Point object.
    * @method Phaser.Utils.Debug#renderPoint
    * @param {Phaser.Point} point - The Point to render.
    * @param {string} [color] - Color of the debug info to be rendered (format is css color string).
    */
    renderPoint: function (point, color) {

        if (this.context === null)
        {
            return;
        }

        color = color || 'rgba(0,255,0,1)';

        this.start();
        this.context.fillStyle = color;
        this.context.fillRect(point.x, point.y, 4, 4);
        this.stop();

    },

    /**
    * Renders a Rectangle.
    * @method Phaser.Utils.Debug#renderRectangle
    * @param {Phaser.Rectangle} rect - The Rectangle to render.
    * @param {string} [color] - Color of the debug info to be rendered (format is css color string).
    * @param {boolean} [filled=true] - Render the rectangle as a fillRect (default, true) or a strokeRect (false)
    */
    renderRectangle: function (rect, color, filled) {

        if (this.context === null)
        {
            return;
        }

        if (typeof filled === 'undefined') { filled = true; }

        color = color || 'rgba(0,255,0,0.3)';

        this.start();

        if (filled)
        {
            this.context.fillStyle = color;
            this.context.fillRect(rect.x, rect.y, rect.width, rect.height);
        }
        else
        {
            this.context.strokeStyle = color;
            this.context.strokeRect(rect.x, rect.y, rect.width, rect.height);
        }

        this.stop();
        
    },

    /**
    * Renders a Circle.
    * @method Phaser.Utils.Debug#renderCircle
    * @param {Phaser.Circle} circle - The Circle to render.
    * @param {string} [color] - Color of the debug info to be rendered (format is css color string).
    */
    renderCircle: function (circle, color) {

        if (this.context === null)
        {
            return;
        }

        color = color || 'rgba(0,255,0,0.3)';

        this.start();
        this.context.beginPath();
        this.context.fillStyle = color;
        this.context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2, false);
        this.context.fill();
        this.context.closePath();
        this.stop();

    },

    /**
    * Render text.
    * @method Phaser.Utils.Debug#renderText
    * @param {string} text - The line of text to draw.
    * @param {number} x - X position of the debug info to be rendered.
    * @param {number} y - Y position of the debug info to be rendered.
    * @param {string} [color] - Color of the debug info to be rendered (format is css color string).
    * @param {string} font - The font of text to draw.
    */
    renderText: function (text, x, y, color, font) {

        if (this.context === null)
        {
            return;
        }

        color = color || 'rgb(255,255,255)';
        font = font || '16px Courier';

        this.start();
        this.context.font = font;
        this.context.fillStyle = color;
        this.context.fillText(text, x, y);
        this.stop();

    },

    /**
    * Render Sprite Body Physics Data as text.
    * @method Phaser.Utils.Debug#renderBodyInfo
    * @param {Phaser.Sprite} sprite - The sprite to be rendered.
    * @param {number} x - X position of the debug info to be rendered.
    * @param {number} y - Y position of the debug info to be rendered.
    * @param {string} [color='rgb(255,255,255)'] - color of the debug info to be rendered. (format is css color string).
    */
    renderBodyInfo: function (sprite, x, y, color) {

        if (this.context === null)
        {
            return;
        }

        color = color || 'rgb(255,255,255)';

        this.start(x, y, color, 210);

        this.splitline('x: ' + sprite.body.x.toFixed(2), 'y: ' + sprite.body.y.toFixed(2), 'width: ' + sprite.width, 'height: ' + sprite.height);
        // this.splitline('speed: ' + sprite.body.speed.toFixed(2), 'angle: ' + sprite.body.angle.toFixed(2), 'linear damping: ' + sprite.body.linearDamping);
        // this.splitline('blocked left: ' + sprite.body.blocked.left, 'right: ' + sprite.body.blocked.right, 'up: ' + sprite.body.blocked.up, 'down: ' + sprite.body.blocked.down);
        // this.splitline('touching left: ' + sprite.body.touching.left, 'right: ' + sprite.body.touching.right, 'up: ' + sprite.body.touching.up, 'down: ' + sprite.body.touching.down);
        // this.splitline('gravity x: ' + sprite.body.gravity.x, 'y: ' + sprite.body.gravity.y, 'world gravity x: ' + this.game.physics.gravity.x, 'y: ' + this.game.physics.gravity.y);
        // this.splitline('acceleration x: ' + sprite.body.acceleration.x.toFixed(2), 'y: ' + sprite.body.acceleration.y.toFixed(2));
        // this.splitline('velocity x: ' + sprite.body.velocity.x.toFixed(2), 'y: ' + sprite.body.velocity.y.toFixed(2), 'deltaX: ' + sprite.body.deltaX().toFixed(2), 'deltaY: ' + sprite.body.deltaY().toFixed(2));
        // this.splitline('bounce x: ' + sprite.body.bounce.x.toFixed(2), 'y: ' + sprite.body.bounce.y.toFixed(2));
        this.stop();

    },

    /**
    * @method Phaser.Utils.Debug#renderPhysicsBody
    * @param {Phaser.Physics.Body} body - The Phaser.Physics.Body instance to render all shapes from.
    * @param {string} [color='rgb(255,255,255)'] - The color the polygon is stroked in.
    */
    renderPhysicsBody: function (body, color) {

        if (this.context === null)
        {
            return;
        }

        color = color || 'rgb(255,255,255)';

        this.start(0, 0, color);

        var shapes = body.data.shapes;
        var shapeOffsets = body.data.shapeOffsets;
        var shapeAngles = body.data.shapeAngles;

        var i = shapes.length;
        var x = this.game.math.p2pxi(body.data.position[0]) - this.game.camera.view.x;
        var y = this.game.math.p2pxi(body.data.position[1]) - this.game.camera.view.y;
        var angle = body.data.angle;

        while (i--)
        {
            if (shapes[i] instanceof p2.Rectangle)
            {
                this.renderShapeRectangle(x, y, angle, shapes[i], shapeOffsets[i], shapeAngles[i]);
            }
            else if (shapes[i] instanceof p2.Line)
            {
                this.renderShapeLine(x, y, angle, shapes[i], shapeOffsets[i], shapeAngles[i]);
            }
            else if (shapes[i] instanceof p2.Convex)
            {
                this.renderShapeConvex(x, y, angle, shapes[i], shapeOffsets[i], shapeAngles[i]);
            }
            else if (shapes[i] instanceof p2.Circle)
            {
                this.renderShapeCircle(x, y, angle, shapes[i], shapeOffsets[i], shapeAngles[i]);
            }
        }

        this.stop();

    },

    /**
    * Renders a p2.Rectangle shape. Do not call this directly - instead use Debug.renderPhysicsBody.
    *
    * @method Phaser.Utils.Debug#renderShapeRectangle
    * @param {number} x - The x coordinate of the Shape to translate to.
    * @param {number} y - The y coordinate of the Shape to translate to.
    * @param {number} bodyAngle - The angle of the Body to rotate to.
    * @param {p2.Shape} shape - The shape to render.
    * @param {array} offset - The shape offset vector.
    * @param {number} angle - The shape angle.
    */
    renderShapeRectangle: function (x, y, bodyAngle, shape, offset, angle) {
        
        var w = this.game.math.p2px(shape.width);
        var h = this.game.math.p2px(shape.height);
        var points = shape.vertices;

        this.context.beginPath();
        this.context.save();
        this.context.translate(x + this.game.math.p2pxi(offset[0]), y + this.game.math.p2pxi(offset[1]));
        this.context.rotate(bodyAngle + angle);

        this.context.moveTo(this.game.math.p2pxi(points[0][0]), this.game.math.p2pxi(points[0][1]));

        for (var i = 1; i < points.length; i++)
        {
            this.context.lineTo(this.game.math.p2pxi(points[i][0]), this.game.math.p2pxi(points[i][1]));
        }

        this.context.closePath();
        this.context.stroke();
        this.context.restore();

    },

    /**
    * Renders a p2.Line shape. Do not call this directly - instead use Debug.renderPhysicsBody.
    *
    * @method Phaser.Utils.Debug#renderShapeLine
    * @param {number} x - The x coordinate of the Shape to translate to.
    * @param {number} y - The y coordinate of the Shape to translate to.
    * @param {number} bodyAngle - The angle of the Body to rotate to.
    * @param {p2.Shape} shape - The shape to render.
    * @param {array} offset - The shape offset vector.
    * @param {number} angle - The shape angle.
    */
    renderShapeLine: function (x, y, bodyAngle, shape, offset, angle) {
        
        this.context.beginPath();
        this.context.save();
        this.context.translate(x, y);
        this.context.rotate(bodyAngle + angle);
        this.context.lineWidth = 0.5;
        this.context.moveTo(0, 0);
        this.context.lineTo(this.game.math.p2px(shape.length), 0);
        this.context.closePath();
        this.context.stroke();
        this.context.restore();

    },

    /**
    * Renders a convex shape. Do not call this directly - instead use Debug.renderPhysicsBody.
    *
    * @method Phaser.Utils.Debug#renderShapeConvex
    * @param {number} x - The x coordinate of the Shape to translate to.
    * @param {number} y - The y coordinate of the Shape to translate to.
    * @param {number} bodyAngle - The angle of the Body to rotate to.
    * @param {p2.Shape} shape - The shape to render.
    * @param {array} offset - The shape offset vector.
    * @param {number} angle - The shape angle.
    */
    renderShapeConvex: function (x, y, bodyAngle, shape, offset, angle) {

        var points = shape.vertices;

        this.context.beginPath();
        this.context.save();
        this.context.translate(x + this.game.math.p2pxi(offset[0]), y + this.game.math.p2pxi(offset[1]));
        this.context.rotate(bodyAngle + angle);

        this.context.moveTo(this.game.math.p2pxi(points[0][0]), this.game.math.p2pxi(points[0][1]));

        for (var i = 1; i < points.length; i++)
        {
            this.context.lineTo(this.game.math.p2pxi(points[i][0]), this.game.math.p2pxi(points[i][1]));
        }

        // this.context.arc(0, 0, this.game.math.p2px(shape.radius) , 0, Math.PI * 2);

        this.context.closePath();
        this.context.stroke();
        this.context.restore();

    },

    /**
    * Renders a p2.Circle shape. Do not call this directly - instead use Debug.renderPhysicsBody.
    *
    * @method Phaser.Utils.Debug#renderShapeCircle
    * @param {number} x - The x coordinate of the Shape to translate to.
    * @param {number} y - The y coordinate of the Shape to translate to.
    * @param {number} bodyAngle - The angle of the Body to rotate to.
    * @param {p2.Shape} shape - The shape to render.
    * @param {array} offset - The shape offset vector.
    * @param {number} angle - The shape angle.
    */
    renderShapeCircle: function (x, y, bodyAngle, shape, offset, angle) {

        this.context.beginPath();
        this.context.save();
        this.context.translate(x + this.game.math.p2pxi(offset[0]), y + this.game.math.p2pxi(offset[1]));
        this.context.arc(0, 0, this.game.math.p2px(shape.radius) , 0, Math.PI * 2);
        this.context.closePath();
        this.context.stroke();
        this.context.restore();

    }

};

Phaser.Utils.Debug.prototype.constructor = Phaser.Utils.Debug;
