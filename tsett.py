import math, os
from fractions import Fraction

sensor_4_3 = {1.3, 3, 5, 12}
sensor_type = '1/2.8"'
sensor_type = sensor_type.replace('"', '')
sz = sensor_type.split('/')
sensor_size = float(sz[0])/float(sz[1])

megapixel = 4
focus = 2.8
diagonal_sensor = sensor_size * 2/3 * 25.4
def compute_fov(megapixel, diagonal_sensor, focus):
    if megapixel in sensor_4_3:
        width_sensor = diagonal_sensor * 0.8
        height_sensor = diagonal_sensor * 0.6
    else:
        width_sensor = diagonal_sensor * 16 / 337**0.5
        height_sensor = diagonal_sensor * 9 / 337**0.5
    horizontal_fov = 2 * math.atan(width_sensor / (2 * focus)) * 180 / math.pi
    vertical_fov = 2 * math.atan(height_sensor / (2 * focus)) * 180 / math.pi
    diagonal_fov = 2 * math.atan(diagonal_sensor / (2 * focus)) * 180 / math.pi
    return width_sensor, height_sensor, horizontal_fov, vertical_fov, diagonal_fov

def compute_diagonal(width_sensor, height_sensor):
    diagonal_sensor = (width_sensor**2 + height_sensor**2)**0.5
    return diagonal_sensor

def print_info(list):
    diagonal = compute_diagonal(list[0], list[1])
    print(f"Sensor Size: {list[0]:.2f} х {list[1]:.2f}") 
    print(f"Sensor Diagonal: {diagonal:.2f}")
    print("Horizontal FOV", list[2])

os.system('cls')

origin = compute_fov(megapixel, diagonal_sensor, focus)
print("Sensor:", sensor_type)
print_info(origin)
ppm=250
id=6
hor_px=2560
ss = (focus * hor_px) / (ppm*id)
ss_diag = compute_diagonal(ss, ss*0.5625)
manual = compute_fov(megapixel, ss_diag, focus)
print("Manual FOV")
print_info(manual)
print(ss_diag/diagonal_sensor)
print(manual[2]/origin[2])