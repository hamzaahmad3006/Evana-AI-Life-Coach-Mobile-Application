import deepgram
import pkgutil
import importlib

def find_class(module, name):
    for _, subname, ispkg in pkgutil.walk_packages(module.__path__, module.__name__ + '.'):
        try:
            submod = importlib.import_module(subname)
            if hasattr(submod, name):
                print(f"FOUND {name} in {subname}")
                return True
        except:
            continue
    return False

print(f"Deepgram version: {deepgram.__version__}")
if not find_class(deepgram, 'PrerecordedOptions'):
    print("PrerecordedOptions NOT FOUND")
if not find_class(deepgram, 'SpeakOptions'):
    print("SpeakOptions NOT FOUND")
