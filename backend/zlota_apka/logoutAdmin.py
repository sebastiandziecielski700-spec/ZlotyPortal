from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .utils import supabase

@csrf_exempt
def logout_admin(request):
    if request.method == "OPTIONS":
        return response

    if request.method == 'POST':
        try:
            body = json.loads(request.body)
            admin_id = body.get('admin_id')
            if admin_id:
                res = supabase.table('admin') \
                    .update({'logged_Admin': False}) \
                    .eq('id_admin', admin_id) \
                    .execute()
                response = JsonResponse({'success': True})
                origin = request.headers.get('Origin')
                response["Access-Control-Allow-Origin"] = origin if origin else "*"
                return response
            
            return JsonResponse({'success': False, 'message': 'No ID'}, status=400)
        except Exception as e:
            print(f"BŁĄD: {str(e)}") # DEBUG
            return JsonResponse({'success': False, 'error': str(e)}, status=500)