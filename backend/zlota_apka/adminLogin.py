from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .utils import supabase 

@csrf_exempt
def admin_login(request):

    if request.method == "OPTIONS":
        response = JsonResponse({"status": "ok"})

        origin = request.headers.get('Origin')
        response["Access-Control-Allow-Origin"] = origin if origin else "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type"
        return response

    if request.method == 'POST':
        try:
            body = json.loads(request.body)
            login_input = body.get('login')
            password_input = body.get('password')

            result = supabase.table('admin').select("*") \
                .eq('admin_login', login_input) \
                .eq('admin_password', password_input) \
                .execute()

            if result.data and len(result.data) > 0:
                admin_data = result.data[0]
                admin_id = admin_data['id_admin']
                supabase.table('admin') \
                    .update({'logged_Admin': True}) \
                    .eq('id_admin', admin_id) \
                    .execute()

                response_data = {
                    'success': True,
                    'message': 'Zalogowano pomyślnie',
                    'admin': {
                        'id': admin_id,
                        'name': admin_data['name'],
                        'surname': admin_data['surname']
                    }
                }
                
                response = JsonResponse(response_data)
                origin = request.headers.get('Origin')
                response["Access-Control-Allow-Origin"] = origin if origin else "*"
                return response

            else:
                return JsonResponse({
                    'success': False, 
                    'message': 'Niepoprawny login lub hasło'
                }, status=401)

        except Exception as e:
            return JsonResponse({
                'success': False, 
                'message': f'Błąd serwera: {str(e)}'
            }, status=500)

    return JsonResponse({'error': 'Method not allowed'}, status=405)