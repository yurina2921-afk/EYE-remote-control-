from microbit import *
import random

# Servo frequency is 50Hz (20ms period)
# Duty cycle for 1ms is approx 51 (for 0 degrees)
# Duty cycle for 1.5ms is approx 77 (for 90 degrees)
# Duty cycle for 2ms is approx 102 (for 180 degrees)

PIN_EYELID_LL = pin0
PIN_EYELID_LR = pin2
PIN_EYELID_UL = pin12
PIN_EYELID_UR = pin13
PIN_VERTICAL = pin8
PIN_HORIZONTAL = pin14

# User mentioned they already coded the angles, but I'll provide placeholders
# that can be adjusted.
POS_OPEN = 90
POS_CLOSED = 180
POS_CENTER = 90

# State variables
vert_pos = POS_CENTER
horiz_pos = POS_CENTER
is_blinking = False
next_blink_time = running_time() + 3000

def set_servo(pin, angle):
    # Map 0-180 to 25-125 for write_analog
    # This is a common mapping, adjust if needed
    duty = int(25 + (angle / 180.0) * 100)
    pin.write_analog(duty)

def blink():
    set_servo(PIN_EYELID_UL, POS_CLOSED)
    set_servo(PIN_EYELID_UR, POS_CLOSED)
    set_servo(PIN_EYELID_LL, POS_CLOSED)
    set_servo(PIN_EYELID_LR, POS_CLOSED)
    sleep(150)
    set_servo(PIN_EYELID_UL, POS_OPEN)
    set_servo(PIN_EYELID_UR, POS_OPEN)
    set_servo(PIN_EYELID_LL, POS_OPEN)
    set_servo(PIN_EYELID_LR, POS_OPEN)

def wink():
    set_servo(PIN_EYELID_UL, POS_CLOSED)
    set_servo(PIN_EYELID_LL, POS_CLOSED)
    sleep(200)
    set_servo(PIN_EYELID_UL, POS_OPEN)
    set_servo(PIN_EYELID_LL, POS_OPEN)

def main():
    global next_blink_time, vert_pos, horiz_pos
    
    # Initialize positions
    set_servo(PIN_VERTICAL, POS_CENTER)
    set_servo(PIN_HORIZONTAL, POS_CENTER)
    set_servo(PIN_EYELID_UL, POS_OPEN)
    set_servo(PIN_EYELID_UR, POS_OPEN)
    set_servo(PIN_EYELID_LL, POS_OPEN)
    set_servo(PIN_EYELID_LR, POS_OPEN)

    while True:
        # Check Serial
        if uart.any():
            cmd = uart.read(1).decode('utf-8')
            if cmd == 'U':
                vert_pos = min(180, vert_pos + 10)
                set_servo(PIN_VERTICAL, vert_pos)
            elif cmd == 'D':
                vert_pos = max(0, vert_pos - 10)
                set_servo(PIN_VERTICAL, vert_pos)
            elif cmd == 'L':
                horiz_pos = max(0, horiz_pos - 10)
                set_servo(PIN_HORIZONTAL, horiz_pos)
            elif cmd == 'R':
                horiz_pos = min(180, horiz_pos + 10)
                set_servo(PIN_HORIZONTAL, horiz_pos)
            elif cmd == 'C' or cmd == 'H':
                vert_pos = POS_CENTER
                horiz_pos = POS_CENTER
                set_servo(PIN_VERTICAL, vert_pos)
                set_servo(PIN_HORIZONTAL, horiz_pos)
            elif cmd == 'B':
                blink()
            elif cmd == '2':
                blink()
                sleep(100)
                blink()
            elif cmd == 'W':
                wink()
            
            # Reset blink timer when manual command received
            next_blink_time = running_time() + 4000

        # Auto blink
        if running_time() > next_blink_time:
            r = random.randint(0, 10)
            if r < 2: # Double blink sometimes
                blink()
                sleep(100)
                blink()
            elif r < 3: # Wink sometimes
                wink()
            else:
                blink()
            
            # Randomize next blink time (2-5 seconds)
            next_blink_time = running_time() + random.randint(2000, 5000)

        sleep(20)

main()
