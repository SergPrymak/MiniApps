import math, os
from fractions import Fraction

sensor_4_3 = {1.3, 3, 5, 12}
sensor_type = '1/2.9"'
sensor_type = sensor_type.replace('"', '')
sz = sensor_type.split('/')
sensor_size = float(sz[0])/float(sz[1])

megapixel = 4
focus = 2.8
diagonal_sensor = sensor_size * 2/3 * 25.4

if megapixel in sensor_4_3:
    width_sensor = diagonal_sensor * 4 / 5
    height_sensor = diagonal_sensor * 3 / 5
else:
    width_sensor = diagonal_sensor * 16 / 337**0.5
    height_sensor = diagonal_sensor * 9 / 337**0.5

horizontal_fov = 2 * math.atan(width_sensor / (2 * focus)) * 180 / math.pi
vertical_fov = 2 * math.atan(height_sensor / (2 * focus)) * 180 / math.pi
diagonal_fov = 2 * math.atan(diagonal_sensor / (2 * focus)) * 180 / math.pi

os.system('cls')
print("Sensor:", sensor_type)
print(f"Sensor Size: {width_sensor:.2f} х {height_sensor:.2f}") 
print("Horizontal FOV", horizontal_fov)
print("Vertical FOV", vertical_fov)
print("Diagonal FOV", diagonal_fov)