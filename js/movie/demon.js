
define([
    'mo/lang',
    'dollar',
    'eventmaster',
    'choreo'
], function(_, $, event, choreo){

    function Demon(opt){
        var body = $(opt.body || document.body),
            origin = this.origin = $(opt.origin);
        this.eyeLeft = $('<span class="eye eye-left"><span></span></span>');
        this.eyeRight = $('<span class="eye eye-right"><span></span></span>');
        this.handLeft = $('<span class="hand hand-left"></span>');
        this.handRight = $('<span class="hand hand-right"></span>');
        this.legLeft = $('<span class="leg leg-left"></span>');
        this.legRight = $('<span class="leg leg-right"></span>');
        this.me = origin.clone();
        this.me.css({
            top: origin.offset().top + 'px',
            left: origin.offset().left + 'px'
        }).addClass('demon')
            .append(this.eyeLeft)
            .append(this.eyeRight)
            .append(this.handLeft)
            .append(this.handRight)
            .append(this.legLeft)
            .append(this.legRight)
            .appendTo(body);
        if (opt.className) {
            this.me.addClass(opt.className);
        }
        origin.css({
            visibility: 'hidden'
        });
    }

    Demon.prototype = {
    
        showBody: function(){
            this.me.addClass('waken');
            return this;
        },

        showEyes: function(){
            this.me.addClass('has-eyes');
            return this;
        },

        showHands: function(){
            this.me.addClass('has-hands');
            return this;
        },

        showLegs: function(){
            this.me.addClass('has-legs');
            return this;
        },

        rotateEye: function(deg, duration, easing){
            var action = choreo().play(),
                //current = choreo.transform(this.eyeLeft[0], 'rotate'),
                //v = 'rotate(' + (parseFloat(current) + parseFloat(deg)) + 'deg)';
                v = 'rotate(' + deg + ')';
            action.actor(this.eyeLeft[0], {
                transform: v
            }, duration, easing);
            action.actor(this.eyeRight[0], {
                transform: v
            }, duration, easing);
            return action.follow();
        },

        moveEye: function(offset, duration, easing){
            var action = choreo().play(),
                left_pupil = this.eyeLeft.find('span')[0],
                max = this.eyeLeft[0].scrollHeight/2 - left_pupil.scrollHeight/2,
                v = 'translateX(' + offset * max + 'px)';
            action.actor(left_pupil, {
                transform: v
            }, duration, easing);
            action.actor(this.eyeRight.find('span')[0], {
                transform: v
            }, duration, easing);
            return action.follow();
        },

        rotateHand: function(side, deg, duration, easing){
            var action = choreo().play(),
                v = 'rotate(' + deg + ')';
            action.actor(this['hand' + capitalize(side)][0], {
                transform: v
            }, duration, easing);
            return action.follow();
        },

        rotateLeg: function(side, deg, duration, easing){
            var action = choreo().play(),
                v = 'rotate(' + deg + ')';
            action.actor(this['leg' + capitalize(side)][0], {
                transform: v
            }, duration, easing);
            return action.follow();
        },

        jump: function(height, offsets, duration, easing){
            var action = choreo(),
                action_drop = choreo(),
                me = this.me,
                current = parseFloat(me.css('top')) || 0;
            this.move(offsets || [], duration, easing);
            action.actor(me[0], {
                'top': current - parseFloat(height) + 'px'
            }, Math.ceil(duration*3/5), 'easeOutBack');
            return action.play().follow().done(function(){
                action_drop.actor(me[0], {
                    'top': current + 'px'
                }, Math.ceil(duration*2/5), 'easeInQuad');
                return action_drop.play().follow();
            }).follow();
        },

        move: function(offsets, duration, easing){
            var action = choreo(),
                x = parseFloat(offsets[0] || 0),
                y = parseFloat(offsets[1] || 0),
                currentX = parseFloat(choreo.transform(this.me[0], 'translateX')) || 0,
                currentY = parseFloat(choreo.transform(this.me[0], 'translateY')) || 0;
            x += currentX,
            y += currentY;
        
            action.actor(this.me[0], {
                'transform': 'translate(' + x + 'px, ' + y + 'px)'
            }, duration, easing);

            return action.play().follow();
        },

        walk: function(offsets, duration, easing){
            var left_action = choreo(),
                right_action = choreo(),
                is_end = false,
                left_lift = true,
                right_lift = true,
                x = parseFloat(offsets[0] || 0),
                y = parseFloat(offsets[1] || 0),
                length = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)),
                left = left_action.actor(this.legLeft[0], {
                    'height': parseFloat(this.legLeft.height())*3/5 + 'px'
                }, duration/length*8, 'easeInOut'),
                right = right_action.actor(this.legRight[0], {
                    'height': parseFloat(this.legRight.height())*3/5 + 'px'
                }, duration/length*8, 'easeInOut');

            left_action.play().follow().done(function(){
                right_action.play();
                return left_step();
            }).follow().done(left_step);

            right_action.follow().done(right_step);
            
            function left_step(){
                if (is_end && !left_lift) {
                    return false;
                }
                left.reverse();
                left_lift = !left_lift;
                return left_action.play().follow().done(function(){
                    return left_step();
                }).follow();
            }

            function right_step(){
                if (is_end && !right_lift) {
                    return false;
                }
                right.reverse();
                right_lift = !right_lift;
                return right_action.play().follow().done(function(){
                    return right_step();
                }).follow();
            }

            return this.move(offsets, duration, easing).done(function(){
                is_end = true;
            });
        },

        speak: function(){
        
        }

    };

    function capitalize(str){
        return str.replace(/^\w/, function(s){
            return s.toUpperCase();
        });
    }

    function exports(opt){
        return new exports.Demon(opt);
    }

    exports.Demon = Demon;

    return exports;

});
