import sys
import os

sys.path.append('D:\venus\shaka-player\build')
sys.path.append('D:\venus\shaka-player\third_party\closure\deps')
print(sys.path)

import all
import shakaBuildHelpers

if __name__ == '__main__':
  shakaBuildHelpers.runMain(all.main)
